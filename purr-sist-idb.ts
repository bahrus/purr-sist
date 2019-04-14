import {Store, set, get} from 'idb-keyval/dist/idb-keyval.mjs';
import { PurrSist, PurrSistAttribs } from './purr-sist.js';
import {disabled, up} from 'trans-render/hydrate.js';
import {define} from 'trans-render/define.js';
export const idb_item_set = 'idb-item-set';
const store_name = 'store-name';
const db_name = 'db-name';
export interface PurrSistIDBAttribs extends PurrSistAttribs {
    [store_name]: string;
    [db_name]: string;
}


export class PurrSistIDB extends PurrSist{
    static get is(){return 'purr-sist-idb';}
    static get observedAttributes(){
        return super.observedAttributes.concat([store_name, db_name]);
    }
    _storeName = 'idb';
    get storeName(){
        return this._storeName;
    }
    set storeName(nv){
        this.attr(store_name, nv);
    }
    _dbName = 'purr-sist';
    get dbName(){
        return this._dbName;
    }
    set dbName(nv){
        this.attr(db_name, nv);
    }
    attributeChangedCallback(n: keyof PurrSistIDBAttribs, ov: string, nv: string){
        switch(n){
            case store_name:
                this._storeName = nv;
                break;
            case db_name:
                this._dbName = nv;
                break;
        }
        super.attributeChangedCallback(n as keyof PurrSistAttribs, ov, nv);
    }
    handleAnyChange(){
        this.getStore();
    }
    connectedCallback(){
        this[up](['dbName', 'storeName']);
        super.connectedCallback();
    }
    _store: Store;
    onPropsChange(){
        if (!this._conn || this._disabled) return;
        this._store = new Store(this._dbName, this._storeName);
        super.onPropsChange();
        window.addEventListener(idb_item_set, e =>{
            this.handleAnyChange();
        })
        
    }
    createNew(master: PurrSist | null) : void{
        const newVal = {};
        if(!this._storeId){
            const storeId = Math.random().toString().replace('.','');
            const test = get(storeId, this._store).then((val:any) =>{
                console.log(val);
                if(val === undefined){
                    this.storeId = storeId;
                    set(this._storeId, newVal, this._store).then(() =>{
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
        set(this._storeId, value, this._store).then(() =>{
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
        if(this._fip) return;
        this._fip = true;
        get(this._storeId, this._store).then((val:any) =>{
            this.value = val;
            this._fip = false;
        })
        
    }
}
define(PurrSistIDB);
