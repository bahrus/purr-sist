import {Store, set, get} from 'idb-keyval/dist/idb-keyval.mjs';
import { PurrSist, bool, notify, obj, str} from './purr-sist.js';
import {define, de} from 'xtal-element/xtal-latx.js';
import {AttributeProps} from 'xtal-element/types.d.js';
export const idb_item_set = 'idb-item-set';

const storeName = 'storeName';
const dbName = 'dbName';

export class PurrSistIDB extends PurrSist{
    static is = 'purr-sist-idb';
    static attributeProps = ({storeName}: PurrSistIDB) => ({
        str: [storeName, dbName, ...str],
        bool: bool,
        notify: notify,
        obj: obj,
        reflect: [...str,...bool, storeName]
    }) as AttributeProps;

    storeName: string | undefined;

    dbName: string | undefined;

    _boundHandleAnyChange: any;
    handleAnyChange(){
        this.getStore();
    }

    _store: Store;
    onPropsChange(name: string){
        super.onPropsChange(name);
        if (this.disabled) return;
        switch(name){
            case storeName:
            case dbName:
                if(this.dbName !== undefined && this.storeName !== undefined){
                    this._store = new Store(this.dbName, this.storeName);
                }
                break;
        }
        
    }

    connectedCallback(){
        super.connectedCallback();
        this._boundHandleAnyChange = this.handleAnyChange.bind(this);
        window.addEventListener(idb_item_set, this._boundHandleAnyChange);
    }

    disconnectedCallback(){
        window.removeEventListener(idb_item_set, this._boundHandleAnyChange);
    }

    createNew() {
        return new Promise<string>((resolve, reject) =>{
            const newVal = {};
            if(this.storeId === undefined){
                const storeId = Math.random().toString().replace('.','');
                const test = get(storeId, this._store).then((val:any) =>{
                    if(val === undefined){
                        resolve(storeId)
                    }else{
                        throw 'not implemented';
                    }
                })
            }
        })

        
    }
    saveNewVal(value: any) : void{
        set(this.storeId, value, this._store).then(() =>{
            this.value = value;
            const ce = new CustomEvent(idb_item_set, {
                bubbles: true,
                detail:{
                    value: value,
                    src: this
                }
            });
            window.dispatchEvent(ce);
        })
        
    }
    _fip!: boolean; //fetch in progress
    getStore(){
        return new Promise<any>((resolve, reject) =>{
            get(this.storeId, this._store).then((val:any) =>{
                this.value = val;
                resolve(val);
            })
        })

        
    }
}
define(PurrSistIDB);
