import {Store, set, get} from 'idb-keyval/dist/idb-keyval.mjs';
import { PurrSist, bool, notify, obj, str} from './purr-sist.js';
import {define} from 'xtal-element/xtal-latx.js';
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

    storeName = 'idb';

    dbName = 'purr-sist';

    _boundHandleAnyChange: any;
    handleAnyChange(){
        this.getStore();
    }

    _store: Store;
    onPropsChange(name: string){
        super.onPropsChange(name);
        if (this._disabled) return;
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

    createNew(master: PurrSist | null) : void{
        if(this._initInProgress) return;
        const newVal = {};
        if(this.storeId === undefined){
            const storeId = Math.random().toString().replace('.','');
            this._initInProgress = true;
            const test = get(storeId, this._store).then((val:any) =>{
                if(val === undefined){
                    this.storeId = storeId;
                    this._initInProgress = false;
                    set(this.storeId, newVal, this._store).then(() =>{
                        this.de('new-store-id', {
                            value: this.storeId
                        }, true);
                    })
                }else{
                    throw 'not implemented';
                }
            })
        }
        
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
    getStore() : void{
        if(this._fip || this._store === undefined || this.storeId === undefined) return;
        this._fip = true;
        get(this.storeId, this._store).then((val:any) =>{
            this.value = val;
            this._fip = false;
        })
        
    }
}
define(PurrSistIDB);
