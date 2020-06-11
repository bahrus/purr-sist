import { XtallatX } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { getHost } from 'xtal-element/getHost.js';
export const bool = ['write', 'read', 'new'];
export const str = ['guid', 'storeRegistryId', 'storeId'];
export const notify = ['value', 'storeId'];
export const obj = ['value'];
/**
 * `purr-sist`
 *  Custom element wrapper around persistence services.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class PurrSist extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        this._initInProgress = false;
    }
    syncListRegistry() {
        if (!this.storeRegistryId || !this.guid)
            return;
        const registry = this.getRegistry();
        if (!registry || !registry.value) {
            setTimeout(() => {
                this.syncListRegistry();
            }, 50);
            return;
        }
        if (registry.value[this.guid] === undefined) {
            const newVal = Object.assign(registry.value, {
                [this.guid]: this.storeId
            });
            registry.newVal = newVal;
        }
    }
    pullRecFromRegistry(registry) {
        if (registry.value[this.guid] === undefined) {
            if (this.write) {
                this.createNew(registry);
            }
        }
        else {
            this.storeId = registry.value[this.guid];
        }
    }
    set refresh(val) {
        this.storeId = this.storeId;
    }
    get syncVal() {
        return this._syncVal;
    }
    set syncVal(val) {
        this._syncVal = val;
        this.value = val;
    }
    get newVal() {
        return this._newVal;
    }
    set newVal(val) {
        if (val === null)
            return;
        this._newVal = val;
        if (!this.storeId) {
            return;
        }
        this.saveNewVal(val);
    }
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    getRegistry() {
        const mlid = this.storeRegistryId;
        if (mlid.startsWith('/')) {
            return self[mlid.substr(1)];
        }
        if (mlid.startsWith('./')) {
            const id = mlid.substr(2);
            const host = getHost(this);
            const host2 = host.shadowRoot ? host.shadowRoot : host;
            return host2.querySelector('#' + id);
        }
    }
    onPropsChange(n) {
        super.onPropsChange(n);
        if (this.disabled)
            return;
        //if(this._retrieve && !this._storeId) return;
        if (!this.storeId) {
            if (this.storeRegistryId) {
                const mst = this.getRegistry();
                if (!mst || !mst.value) {
                    setTimeout(() => {
                        this.onPropsChange(n);
                    }, 50);
                    return;
                }
                this.pullRecFromRegistry(mst);
            }
            else if (this.new && this.write) {
                this.createNew(null);
            }
            //create new object
        }
        else {
            if (this.write)
                return;
            this.getStore();
        }
    }
}
