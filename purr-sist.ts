import {XtallatX} from 'xtal-latx/xtal-latx.js';
import {define} from 'xtal-latx/define.js';
interface KVP{
    key: string;
    value: any;
}
const store_id = 'store-id';
const save_service_url = 'save-service-url';
const new_val = 'new_val';
export class PurrSist extends XtallatX(HTMLElement){
    static get is(){return 'purr-sist';}
    
    static get observedAttributes(){
        return super.observedAttributes.concat([store_id]);
    }
    attributeChangedCallback(n: string, ov: string, nv: string){
        super.attributeChangedCallback(n, ov, nv);
        switch(n){
            case store_id:
                this._storeId = nv;
                break;
            case save_service_url:
                this._saveServiceUrl = nv;
                break;
        }
        this.onPropsChange()
    }
    _storeId!: string;
    get storeId(){
        return this._storeId;
    }
    set storeId(val){
        this.attr(store_id, val);
    }
    _saveServiceUrl: string = 'https://api.myjson.com/bins';
    get saveServiceUrl(){
        return this._saveServiceUrl;
    }
    set saveServiceUrl(val){
        this.attr(save_service_url, val);
    }
    _newVal: any;
    get newVal(){
        return this._newVal;
    }
    set newVal(val: KVP){
        this._newVal = val;
        fetch(this._saveServiceUrl + '/' + this._storeId, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            method: 'PUT', 
            body: JSON.stringify(val), 

        }).then(resp =>{
            this.de('newVal',{
                value: val,
            })
        })
    }

    _conn!: boolean;

    connectedCallback(){
        this._upgradeProperties(['disabled', store_id, save_service_url]);
        this._conn = true;
        this.onPropsChange();
    }
    value: any;
    onPropsChange(){
        if(!this._conn || !this._saveServiceUrl) return;
        if(!this._storeId){
            //create new object
            fetch(this._saveServiceUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                method: 'POST', 
                body: JSON.stringify({a: 'b'}),

            }).then(resp =>{
                resp.json().then(json =>{
                    this.innerText =`Please set store-id = ${json.uri.split('/').pop()}`;
                })
            })
        }else{
            fetch(this._saveServiceUrl + '/' + this._storeId).then(resp =>{
                resp.json().then(json =>{
                    this.value = json;
                    this.de('value', {
                        value: json
                    })
                })
            })
        }
    }
}

define(PurrSist);