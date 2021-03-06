import { Store, set, get } from 'idb-keyval/dist/idb-keyval.mjs';
import { PurrSist, bool, notify, obj, str } from './purr-sist.js';
import { define } from 'xtal-element/xtal-latx.js';
export const idb_item_set = 'idb-item-set';
const storeName = 'storeName';
const dbName = 'dbName';
let PurrSistIDB = /** @class */ (() => {
    class PurrSistIDB extends PurrSist {
        handleAnyChange() {
            this.getStore();
        }
        onPropsChange(name) {
            super.onPropsChange(name);
            if (this.disabled)
                return;
            switch (name) {
                case storeName:
                case dbName:
                    if (this.dbName !== undefined && this.storeName !== undefined) {
                        this._store = new Store(this.dbName, this.storeName);
                    }
                    break;
            }
        }
        connectedCallback() {
            super.connectedCallback();
            this._boundHandleAnyChange = this.handleAnyChange.bind(this);
            window.addEventListener(idb_item_set, this._boundHandleAnyChange);
        }
        disconnectedCallback() {
            window.removeEventListener(idb_item_set, this._boundHandleAnyChange);
        }
        createNew() {
            return new Promise((resolve, reject) => {
                const newVal = {};
                if (this.storeId === undefined) {
                    const storeId = Math.random().toString().replace('.', '');
                    const test = get(storeId, this._store).then((val) => {
                        if (val === undefined) {
                            resolve(storeId);
                        }
                        else {
                            throw 'not implemented';
                        }
                    });
                }
            });
        }
        saveNewVal(value) {
            set(this.storeId, value, this._store).then(() => {
                this.value = value;
                const ce = new CustomEvent(idb_item_set, {
                    bubbles: true,
                    detail: {
                        value: value,
                        src: this
                    }
                });
                window.dispatchEvent(ce);
            });
        }
        getStore() {
            return new Promise((resolve, reject) => {
                get(this.storeId, this._store).then((val) => {
                    this.value = val;
                    resolve(val);
                });
            });
        }
    }
    PurrSistIDB.is = 'purr-sist-idb';
    PurrSistIDB.attributeProps = ({ storeName }) => ({
        str: [storeName, dbName, ...str],
        bool: bool,
        notify: notify,
        obj: obj,
        reflect: [...str, ...bool, storeName]
    });
    return PurrSistIDB;
})();
export { PurrSistIDB };
define(PurrSistIDB);
