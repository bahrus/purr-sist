import { XtallatX } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { getHost } from 'xtal-element/getHost.js';

type PurrSistKey = keyof PurrSist;
export const bool : PurrSistKey[] = ['write', 'read', 'new'];
export const str: PurrSistKey[] = ['guid', 'storeRegistryId', 'storeId'];
export const notify: PurrSistKey[] = ['value', 'storeId'];
export const obj: PurrSistKey[] = ['value'];

/**
 * `purr-sist`
 *  Custom element wrapper around persistence services.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export abstract class PurrSist extends XtallatX(hydrate(HTMLElement)) {

    storeId: string | undefined;

    write!: boolean;

    read!: boolean;

    new!: boolean;
 
    guid!: string;

    storeRegistryId!: string;

    value: any;

    syncListRegistry(){
        if(!this.storeRegistryId || !this.guid) return;
        const registry = this.getRegistry();
        if(!registry || !registry.value){
            setTimeout(() => {
                this.syncListRegistry();
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

    _syncVal: any;
    get syncVal(){
        return this._syncVal;
    }
    set syncVal(val){
        this._syncVal = val;
        this.value = val;
    }

    _newVal: any;
    get newVal() {
        return this._newVal;
    }
    set newVal(val: any) {
        if(val === null) return;
        this._newVal = val;
        if(!this.storeId){
            return;
        }
        this.saveNewVal(val);
    }

    abstract saveNewVal(value: any) : void;

    _conn!: boolean;

    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    

    
    _initInProgress = false;
    getRegistry(){
        const mlid = this.storeRegistryId;
        if(mlid.startsWith('/')){
            return (<any>self)[mlid.substr(1)] as PurrSist;
        }
        if(mlid.startsWith('./')){
            const id = mlid.substr(2);
            const host = getHost(this) as HTMLElement;
            const host2 = host.shadowRoot ? host.shadowRoot : host;
            return host2.querySelector('#' + id) as PurrSist;
        }
    }
    
    onPropsChange(n: string) {
        super.onPropsChange(n);
        if (this.disabled) return;
        //if(this._retrieve && !this._storeId) return;
        if (!this.storeId) {
            if(this.storeRegistryId){
                const mst = this.getRegistry();
                if(!mst || !mst.value){
                    setTimeout(() =>{
                        this.onPropsChange(n)
                    }, 50);
                    return;
                }
                this.pullRecFromRegistry(mst);
            }else if(this.new && this.write){
                this.createNew(null);
            }
            //create new object

        } else {
            if(this.write) return;
            this.getStore();

        }
    }

    abstract getStore() : void;
}
