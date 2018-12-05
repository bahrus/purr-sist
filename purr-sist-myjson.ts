import {PurrSist} from './purr-sist.js';
import { define } from 'xtal-latx/define.js';

const save_service_url = 'save-service-url';

export class PurrSistMyJson extends PurrSist{
    static get is(){return 'purr-sist-myjson';}

    static get observedAttributes() {
        return super.observedAttributes.concat([save_service_url]);
    }

    attributeChangedCallback(n: string, ov: string, nv: string) {
        switch (n) {
            case save_service_url:
                this._saveServiceUrl = nv;
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }

    createNew(master: PurrSist | null){
        if (this._initInProgress) return;
        const val = {};
        fetch(this._saveServiceUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(val),

        }).then(resp => {
            resp.json().then(json => {
                this._initInProgress = false;
                this.storeId = json.uri.split('/').pop();
                if(this._pendingNewVals){
                    this._pendingNewVals.forEach(kvp =>{
                        this.newVal = kvp;
                    })
                    delete this._pendingNewVals;
                }
                if(master !== null) master.newVal = {
                    [this._guid]: this._storeId,
                }
            })

        })
        this.value = val;
    }

    _saveServiceUrl!: string;// string = 'https://api.myjson.com/bins';
    get saveServiceUrl() {
        return this._saveServiceUrl;
    }
    set saveServiceUrl(val) {
        this.attr(save_service_url, val);
    }

    saveNewVal(value: any){
        fetch(this._saveServiceUrl + '/' + this._storeId, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(value),

        }).then(resp => {
            // this.de('newVal', {
            //     value: val,
            // })
            this.value = value
        })
    }

    connectedCallback() {
        this._upgradeProperties(['saveServiceUrl' ]);
        if(!this._saveServiceUrl){
            if(this._baseLinkId){
                this._saveServiceUrl = this.getFullURL('');
            }else{
                this._saveServiceUrl = 'https://api.myjson.com/bins';
            }
        }
        super.connectedCallback();
    }

    _fip!: boolean; //fetch in progress

    onPropsChange(n?: string) {
        if(!this._saveServiceUrl) return;
        super.onPropsChange();
    }

    getStore(){
        if(this._fip) return;
        this._fip = true;
        fetch(this._saveServiceUrl + '/' + this._storeId).then(resp => {
            resp.json().then(json => {
                json.__purrSistInit = true;
                this.value = json;
                this._fip = false;
            })
        })
    }
}
define(PurrSistMyJson);