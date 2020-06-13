import { XtallatX, de } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { getHost } from 'xtal-element/getHost.js';
export const bool = ['write', 'read', 'anew'];
export const str = ['guid', 'storeRegistryId', 'storeId'];
export const notify = ['value', 'storeId'];
export const obj = ['value', 'registry', 'newStoreId', 'newVal'];
export const PropActions = {
    onNewVal: ({ newVal, disabled, self }) => {
        if (newVal === null || disabled)
            return;
        self.saveNewVal(newVal);
    },
    onSyncVal: ({ syncVal, self, disabled }) => {
        if (disabled)
            return;
        self.value = syncVal;
    },
    onStoreRegistryId: ({ disabled, storeRegistryId, self }) => {
        if (disabled || storeRegistryId === undefined)
            return;
        let registry = undefined;
        if (storeRegistryId.startsWith('/')) {
            registry = window[storeRegistryId.substr(1)];
        }
        if (storeRegistryId.startsWith('./')) {
            const id = storeRegistryId.substr(2);
            const host = getHost(self);
            const host2 = host.shadowRoot ? host.shadowRoot : host;
            registry = host2.querySelector('#' + id);
        }
        if (!registry) {
            setTimeout(() => {
                self.storeRegistryId = storeRegistryId;
            }, 50);
            return;
        }
        if (!registry.value) {
            setTimeout(() => {
                if (!registry.value)
                    registry.getStore().then(store => {
                        self.registry = registry;
                    });
            }, 50);
        }
        else {
            self.registry = registry;
        }
    },
    onRegistry: ({ disabled, registry, self, guid, write }) => {
        if (disabled || registry === undefined || guid === undefined)
            return;
        if (registry.value[guid] === undefined) {
            if (write) {
                self.createNew(registry).then(storeId => {
                    self.newStoreId = storeId;
                });
            }
            else {
                console.warn(`${guid} not found in registry`);
            }
        }
        else {
            self.storeId = registry.value[guid];
        }
    },
    onStoreId: ({ disabled, storeRegistryId, storeId, self, write, anew, registry, read, guid }) => {
        if (disabled)
            return;
        if (storeRegistryId !== undefined && registry === undefined)
            return;
        if (write && anew && storeId === undefined) {
            self.createNew(registry).then(id => {
                self.newStoreId = id;
            });
        }
        else if (read) {
            self.getStore();
        }
    },
    onNewStoreId: ({ newStoreId, self, registry, guid, disabled }) => {
        if (disabled || newStoreId === undefined)
            return;
        self.storeId = newStoreId;
        self.dataset.newStoreId = newStoreId;
        self[de]('new-store-id', {
            value: newStoreId
        }, true);
        if (registry !== undefined)
            registry.newVal = Object.assign(registry.value, {
                [guid]: newStoreId,
            });
    }
};
export class PurrSist extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super(...arguments);
        this.propActions = [
            PropActions.onNewVal,
            PropActions.onSyncVal,
            PropActions.onRegistry,
            PropActions.onStoreId,
            PropActions.onStoreRegistryId,
            PropActions.onNewStoreId,
        ];
    }
    set refresh(val) {
        this.storeId = this.storeId;
    }
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
}
