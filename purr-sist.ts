import { XtallatX, de } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { getHost } from 'xtal-element/getHost.js';

type PurrSistKey = keyof PurrSist;
export const bool : PurrSistKey[] = ['write', 'read', 'anew'];
export const str: PurrSistKey[] = ['guid', 'storeRegistryId', 'storeId'];
export const notify: PurrSistKey[] = ['value', 'storeId'];
export const obj: PurrSistKey[] = ['value', 'registry', 'newStoreId', 'newVal'];

export const PropActions = {
    onNewVal: ({newVal, disabled, self}: PurrSist) => {
        if(newVal === null || disabled) return;
        self.saveNewVal(newVal);
    },
    onSyncVal: ({syncVal, self, disabled}: PurrSist) => {
        if(disabled) return;
        self.value = syncVal;
    },
    onStoreRegistryId: ({disabled, storeRegistryId, self}: PurrSist) => {
        if(disabled || storeRegistryId === undefined) return;
        let registry: PurrSist | undefined = undefined;
        if(storeRegistryId.startsWith('/')){
            registry = (<any>window)[storeRegistryId.substr(1)] as PurrSist;
        }
        if(storeRegistryId.startsWith('./')){
            const id = storeRegistryId.substr(2);
            const host = getHost(self) as HTMLElement;
            const host2 = host.shadowRoot ? host.shadowRoot : host;
            registry = host2.querySelector('#' + id) as PurrSist;
        }
        if(!registry){
            setTimeout(() =>{
                self.storeRegistryId = storeRegistryId;
            }, 50);
            return;
        }
        if(!registry.value){
            setTimeout(() =>{
                if(!registry!.value) registry!.getStore().then(store =>{
                    self.registry = registry!;
                });
            }, 50);
        }else{
            self.registry = registry;
        }
    },
    onRegistry: ({disabled, registry, self, guid, write}: PurrSist) =>{
        if(disabled || registry === undefined || guid === undefined) return;
        if(registry.value[guid] === undefined){
            if(write){
                self.createNew(registry).then(storeId =>{
                    self.newStoreId = storeId;
                })
            }else{
                console.warn(`${guid} not found in registry`);
            }
           
        }else{
            self.storeId = registry.value[guid];
        }
    },
    onStoreId: ({disabled, storeRegistryId, storeId, self, write, anew, registry, read, guid}: PurrSist) =>{
        if(disabled) return;
        if(storeRegistryId !== undefined && registry === undefined) return;
        if(write && anew && storeId === undefined){
            self.createNew(registry).then(id =>{
                self.newStoreId = id;
            });
        }else if(read){
            self.getStore();
        }
    },
    onNewStoreId: ({newStoreId, self, registry, guid, disabled}: PurrSist) =>{
        if(disabled || newStoreId === undefined) return;
        self.storeId = newStoreId;
        self.dataset.newStoreId = newStoreId;
        self[de]('new-store-id', {
            value: newStoreId
        }, true);
        if(registry  !== undefined) registry.newVal = Object.assign(registry.value, {
            [guid]: newStoreId,
        });
    }
};


export abstract class PurrSist extends XtallatX(hydrate(HTMLElement)) {

    storeId: string | undefined;

    newStoreId: string | undefined;

    write!: boolean;

    read!: boolean;

    anew!: boolean;
 
    guid!: string;

    storeRegistryId!: string;

    value: any;

    syncVal: any;

    newVal: any;

    registry!: PurrSist;

    propActions = [
        PropActions.onNewVal, 
        PropActions.onSyncVal, 
        PropActions.onRegistry, 
        PropActions.onStoreId, 
        PropActions.onStoreRegistryId,
        PropActions.onNewStoreId,
    ]


    abstract createNew(registry: PurrSist | null) : Promise<string>;

    set refresh(val: any){
        this.storeId = this.storeId;
    }

    abstract saveNewVal(value: any) : void;

    _conn!: boolean;

    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    

    abstract getStore() : Promise<any>;
}
