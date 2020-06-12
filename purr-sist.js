import { XtallatX } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { getHost } from 'xtal-element/getHost.js';
export const bool = ['write', 'read', 'anew'];
export const str = ['guid', 'storeRegistryId', 'storeId'];
export const notify = ['value', 'storeId'];
export const obj = ['value'];
export const PropActions = {
    setNewVal: ({ newVal, saveNewVal, disabled }) => {
        if (newVal === null || disabled)
            return;
        saveNewVal(newVal);
    },
    setSyncVal: ({ syncVal, self, disabled }) => {
        if (disabled)
            return;
        self.value = syncVal;
    },
    setMiscProps: ({ disabled, storeRegistryId, storeId, self, write, anew }) => {
        if (disabled)
            return;
        if (!storeId) {
            if (storeRegistryId) {
                const mst = self.getStoreRegistry();
                if (!mst || !mst.value) {
                    setTimeout(() => {
                        self.storeRegistryId = storeRegistryId;
                    }, 50);
                    return;
                }
                self.pullRecFromRegistry(mst);
            }
            else if (anew && write) {
                self.createNew(null);
            }
            //create new object
        }
        else {
            if (write)
                return;
            self.getStore();
        }
    }
};
export class PurrSist extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        this.propActions = [PropActions.setNewVal, PropActions.setSyncVal, PropActions.setMiscProps];
        this._initInProgress = false;
    }
    syncStoreRegistry() {
        if (!this.storeRegistryId || !this.guid)
            return;
        const registry = this.getStoreRegistry();
        if (!registry || !registry.value) {
            setTimeout(() => {
                this.syncStoreRegistry();
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
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    getStoreRegistry() {
        const stoRegId = this.storeRegistryId;
        if (stoRegId.startsWith('/')) {
            return self[stoRegId.substr(1)];
        }
        if (stoRegId.startsWith('./')) {
            const id = stoRegId.substr(2);
            const host = getHost(this);
            const host2 = host.shadowRoot ? host.shadowRoot : host;
            return host2.querySelector('#' + id);
        }
    }
    onPropsChange(n) {
        super.onPropsChange(n);
    }
}
