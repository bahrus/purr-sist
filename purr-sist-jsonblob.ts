import { PurrSist, bool, notify, obj, str} from './purr-sist.js';
import { define, de } from 'xtal-element/xtal-latx.js';
import { IBaseLinkContainer, getFullURL } from 'xtal-element/base-link-id.js';
import { AttributeProps } from 'xtal-element/types.d.js';


export class PurrSistJsonBlob extends PurrSist implements IBaseLinkContainer{
    static is = 'purr-sist-jsonblob';

    static attributeProps = ({saveServiceUrl, baseLinkId}: PurrSistJsonBlob) => ({
        str: [saveServiceUrl, baseLinkId, ...str],
        bool: bool,
        notify: notify,
        obj: obj,
        reflect: [saveServiceUrl, baseLinkId, ...str, ...bool]
    }) as AttributeProps;

    saveServiceUrl!: string;

    baseLinkId: string | undefined;

    createNew(registrar: PurrSist | null){
        if (this._initInProgress || this.saveServiceUrl === undefined) return;
        this._initInProgress = true;
        const val = {};
        fetch(this.saveServiceUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(val),

        }).then(resp => {
            this.storeId = resp.headers.get('x-jsonblob')!;
            resp.json().then(json => {
                this._initInProgress = false;
                this.dataset.newStoreId = this.storeId;
                this[de]('new-store-id', {
                    value: this.storeId
                }, true);
                if(registrar !== null) registrar.newVal =Object.assign(registrar.value, {
                    [this.guid]: this.storeId,
                });
            })

        })
        this.value = val;
    }

    saveNewVal(value: any){
        if(this.saveServiceUrl === undefined || this.storeId === undefined) return;
        fetch(this.saveServiceUrl + '/' + this.storeId, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(value),

        }).then(resp => {
            this.value = value;
        })
    }

    connectedCallback() {
        if(!this.saveServiceUrl){
            if(this.baseLinkId !== undefined){
                this.saveServiceUrl = getFullURL(this, '');
            }else{
                this.saveServiceUrl = 'https://jsonblob.com/api/jsonBlob';
            }
        }
        super.connectedCallback();
    }

    _fip!: boolean; //fetch in progress


    getStore(){
        if(this._fip) return;
        if(this.saveServiceUrl === undefined || this.storeId === undefined) return;
        this._fip = true;
        fetch(this.saveServiceUrl + '/' + this.storeId).then(resp => {
            resp.json().then(json => {
                this.value = json;
                this._fip = false;
            })
        })
    }
}
define(PurrSistJsonBlob);