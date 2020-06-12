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
        return new Promise<string>((resolve, reject) =>{
            const val = {};
            fetch(this.saveServiceUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(val),
    
            }).then(resp => {
                const storeId = resp.headers.get('x-jsonblob')!;
                resolve(storeId);
    
            })
            this.value = val;
        });

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
        return new Promise((resolve, reject) =>{
            if(this.saveServiceUrl === undefined || this.storeId === undefined) return undefined;
            fetch(this.saveServiceUrl + '/' + this.storeId).then(resp => {
                resp.json().then(json => {
                    this.value = json;
                    resolve(json);
                })
            })
        });

    }
}
define(PurrSistJsonBlob);