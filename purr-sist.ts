import { XtallatX } from 'xtal-element/xtal-latx.js';
import { disabled, hydrate } from 'trans-render/hydrate.js';
import {getHost} from 'xtal-element/getHost.js';

export const bool = ['write', 'read', 'new'];
export const str = ['guid', 'masterListId', 'storeId'];
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
export abstract class PurrSist extends XtallatX(hydrate(HTMLElement)) {

    storeId: string | undefined;

    write!: boolean;

    read!: boolean;

    new!: boolean;
 
    guid!: string;

    masterListId!: string;

    value: any;

    syncMasterList(){
        if(!this.masterListId || !this.guid) return;
        const master = this.getMaster();
        if(!master || !master.value){
            setTimeout(() => {
                this.syncMasterList();
            }, 50);
            return;
        }
        if(master.value[this.guid] === undefined){
            const newVal = Object.assign(master.value, {
                [this.guid]: this.storeId
            });
            master.newVal = newVal;
        }
    }

    pullRecFromMaster(master: PurrSist){
        if(master.value[this.guid] === undefined){
            if(this.write){
                this.createNew(master);
            }
           
        }else{
            this.storeId = master.value[this.guid];
        }              
    }

    abstract createNew(master: PurrSist | null) : void;

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
    getMaster(){
        const mlid = this.masterListId;
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
        if (this._disabled) return;
        //if(this._retrieve && !this._storeId) return;
        if (!this.storeId) {
            if(this.masterListId){
                const mst = this.getMaster();
                if(!mst || !mst.value){
                    setTimeout(() =>{
                        this.onPropsChange(n)
                    }, 50);
                    return;
                }
                this.pullRecFromMaster(mst);
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
