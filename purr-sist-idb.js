import { Store, get } from 'idb-keyval/dist/idb-keyval.mjs';
import { PurrSist } from './purr-sist';
import { define } from 'xtal-latx/define.js';
// set('hello', 'world').then(() =>{
//     get('hello').then((val: any) =>{
//         console.log(val);
//     })
// })
const store_name = 'store-name';
const db_name = 'db-name';
export class PurrSistIDB extends PurrSist {
    constructor() {
        super(...arguments);
        this._storeName = 'purr-sist';
        this._dbName = 'keyval';
    }
    static get is() { return 'purr-sist-idb'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([store_name, db_name]);
    }
    get storeName() {
        return this._storeName;
    }
    set storeName(nv) {
        this.attr(store_name, nv);
    }
    get dbName() {
        return this._dbName;
    }
    set dbName(nv) {
        this.attr(db_name, nv);
    }
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case store_name:
                this._storeName = nv;
                break;
            case db_name:
                this._dbName = nv;
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
    }
    connectedCallback() {
        this._upgradeProperties(['dbName', 'storeName']);
        super.connectedCallback();
    }
    onPropsChange() {
        if (!this._conn || this._disabled)
            return;
        this._store = new Store(this._dbName, this._storeName);
        if (!this._storeId) {
            const storeId = Math.random().toString().replace('.', '');
            const test = get(storeId, this._store).then((val) => {
                console.log(val);
                if (val === undefined) {
                    this.storeId = storeId;
                }
                else {
                    throw 'not implemented';
                }
            });
        }
    }
    createNew(master) {
        throw 'not implemented';
    }
    saveNewVal(value) {
        throw 'not implemented';
    }
    getStore() {
        throw 'not implemented';
    }
}
define(PurrSistIDB);
//# sourceMappingURL=purr-sist-idb.js.map