import { XtallatX } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { getHost } from 'xtal-element/getHost.js';

type PurrSistKey = keyof PurrSist;
export const bool : PurrSistKey[] = ['write', 'read', 'anew'];
export const str: PurrSistKey[] = ['guid', 'storeRegistryId', 'storeId'];
export const notify: PurrSistKey[] = ['value', 'storeId'];
export const obj: PurrSistKey[] = ['value'];

export const PropActions = {
    setNewVal: ({newVal, saveNewVal, disabled}: PurrSist) => {
        if(newVal === null || disabled) return;
        saveNewVal(newVal);
    },
    setSyncVal: ({syncVal, self, disabled}: PurrSist) =>{
        if(disabled) return;
        self.value = syncVal;
    },
    setMiscProps: ({disabled, storeRegistryId, storeId, self, write, anew}: PurrSist) =>{
        if (disabled) return;
        if (!storeId) {
            if(storeRegistryId){
                const mst = self.getStoreRegistry();
                if(!mst || !mst.value){
                    setTimeout(() =>{
                        self.storeRegistryId = storeRegistryId;
                    }, 50);
                    return;
                }
                self.pullRecFromRegistry(mst);
            }else if(anew && write){
                self.createNew(null);
            }
            //create new object

        } else {
            if(write) return;
            self.getStore();

        }
    }
};


export abstract class PurrSist extends XtallatX(hydrate(HTMLElement)) {

    storeId: string | undefined;

    write!: boolean;

    read!: boolean;

    anew!: boolean;
 
    guid!: string;

    storeRegistryId!: string;

    value: any;

    syncVal: any;

    newVal: any;

    propActions = [PropActions.setNewVal, PropActions.setSyncVal, PropActions.setMiscProps]

    syncStoreRegistry(){
        if(!this.storeRegistryId || !this.guid) return;
        const registry = this.getStoreRegistry();
        if(!registry || !registry.value){
            setTimeout(() => {
                this.syncStoreRegistry();
            }, 50);
            return;
        }
        if(registry.value[this.guid] === undefined){
            const newVal = Object.assign(registry.value, {
                [this.guid]: this.storeId
            });
            registry.newVal = newVal;
        }
    }

    pullRecFromRegistry(registry: PurrSist){
        if(registry.value[this.guid] === undefined){
            if(this.write){
                this.createNew(registry);
            }
           
        }else{
            this.storeId = registry.value[this.guid];
        }              
    }

    abstract createNew(registry: PurrSist | null) : void;

    set refresh(val: any){
        this.storeId = this.storeId;
    }



    abstract saveNewVal(value: any) : void;

    _conn!: boolean;

    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    

    
    _initInProgress = false;
    getStoreRegistry(){
        const stoRegId = this.storeRegistryId;
        if(stoRegId.startsWith('/')){
            return (<any>self)[stoRegId.substr(1)] as PurrSist;
        }
        if(stoRegId.startsWith('./')){
            const id = stoRegId.substr(2);
            const host = getHost(this) as HTMLElement;
            const host2 = host.shadowRoot ? host.shadowRoot : host;
            return host2.querySelector('#' + id) as PurrSist;
        }
    }
    
    onPropsChange(n: string) {
        super.onPropsChange(n);

    }

    abstract getStore() : void;
}
