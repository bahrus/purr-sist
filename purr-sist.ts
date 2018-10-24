import { XtallatX, disabled } from 'xtal-latx/xtal-latx.js';
import { define } from 'xtal-latx/define.js';
import {BaseLinkId, baseLinkId} from 'xtal-latx/base-link-id.js';

const store_id = 'store-id';
const save_service_url = 'save-service-url';
const persist = 'persist';
const create = 'create';
const guid = 'guid';
const master_list_id = 'master-list-id';

/**
 * `purr-sist`
 *  Custom element wrapper around http://myjson.com api.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class PurrSist extends BaseLinkId(XtallatX(HTMLElement)) {
    static get is() { return 'purr-sist'; }

    static get observedAttributes() {
        return super.observedAttributes.concat([store_id, save_service_url, persist, create, guid, master_list_id]);
    }
    attributeChangedCallback(n: string, ov: string, nv: string) {
        console.log(n);
        super.attributeChangedCallback(n, ov, nv);
        switch (n) {
            case store_id:
                this._storeId = nv;
                this.de('store-id',{
                    value: nv
                })
                break;
            case save_service_url:
                this._saveServiceUrl = nv;
                break;
            case master_list_id:
                this._masterListId = nv;
                break;
            case guid:
                this._guid = nv;
                break;
            case create:
            case persist:
                (<any>this)['_' + n] = (nv !== null);
                break;
        }
        this.onPropsChange()
    }
    _storeId!: string;
    get storeId() {
        return this._storeId;
    }
    set storeId(val) {
        this._storeId = val;
        this.attr(store_id, val);
        this.syncMasterList();
    }

    syncMasterList(){
        if(!this._masterListId || !this._guid) return;
        const master = this.getMaster();
        if(!master || !master.value){
            setTimeout(() => {
                this.syncMasterList();
            }, 50);
            return;
        }
        if(master.value[this._guid] === undefined){
            master.newVal = {
                [this._guid]: this._storeId,
            }
        }
    }
    pullRecFromMaster(master: PurrSist){
        if(master.value[this._guid] === undefined){
           this.createNew(master);
        }else{
            this.storeId = master.value[this._guid];
        }              
    }
    createNew(master: PurrSist | null){
        if (this._initInProgress) return;
        fetch(this._saveServiceUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({}),

        }).then(resp => {
            resp.json().then(json => {
                this._initInProgress = false;
                this.storeId = json.uri.split('/').pop();
                if(this._pendingNewVals){
                    this._pendingNewVals.forEach(kvp =>{
                        this.newVal = kvp;
                    })
                    delete this._pendingNewVals;
                }
                if(master !== null) master.newVal = {
                    [this._guid]: this._storeId,
                }
            })

        })
    }
    set refresh(val: any){
        this.storeId = this._storeId;
    }
    _saveServiceUrl!: string;// string = 'https://api.myjson.com/bins';
    get saveServiceUrl() {
        return this._saveServiceUrl;
    }
    set saveServiceUrl(val) {
        this.attr(save_service_url, val);
    }
    _persist!: boolean;
    get persist(){
        return this._persist;
    }
    set persist(nv){
        this.attr(persist, nv, '');
    }
    _create!: boolean;
    get create(){
        return this._create;
    }
    set create(nv: boolean){
        this.attr(create, nv, '');
    }
    _guid!: string;
    get guid(){
        return this._guid;
    }
    set guid(nv: string){
        this.attr(guid, nv);
    }
    _masterListId!: string;
    get masterListId(){
        return this._masterListId;
    }
    set masterListId(nv: string){
        this.attr(master_list_id, nv);
    }
    _pendingNewVals!: any[];
    _newVal: any;
    get newVal() {
        return this._newVal;
    }
    set newVal(val: any) {
        if(val === null) return;
        if(!this._storeId){
            if(!this._pendingNewVals) this._pendingNewVals = [];
            this._pendingNewVals.push(val);
            return;
        }
        this._newVal = val;
        const value = this.value === undefined ? val : Object.assign(this.value, val);
        fetch(this._saveServiceUrl + '/' + this._storeId, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(value),

        }).then(resp => {
            // this.de('newVal', {
            //     value: val,
            // })
            this.setValue(value);
        })
    }

    _conn!: boolean;

    connectedCallback() {
        this._upgradeProperties(['storeId', 'saveServiceUrl', persist, create, disabled, guid, 'masterListId']);
        this.style.display = 'none';
        this._conn = true;
        if(!this._saveServiceUrl){
            if(this._baseLinkId){
                this._saveServiceUrl = this.getFullURL('');
            }else{
                this._saveServiceUrl = 'https://api.myjson.com/bins';
            }
        }
        this.onPropsChange();
    }
    value: any;
    setValue(val: any){
        this.value = val;
        this.de('value', {
            value: val
        })
    }
    _initInProgress = false;
    getMaster(){
        if(!this._masterListId.startsWith('/')) throw 'Must start with "/"';
        return (<any>self)[this._masterListId.substr(1)] as PurrSist;
    }
    _fip!: boolean; //fetch in progress
    onPropsChange() {
        if (!this._conn || !this._saveServiceUrl || this._disabled || !this._persist) return;
        if (!this._storeId) {
            if(this._masterListId){
                const mst = this.getMaster();
                if(!mst || !mst.value){
                    setTimeout(() =>{
                        this.onPropsChange()
                    }, 50);
                    return;
                }
                this.pullRecFromMaster(mst);
            }else if(this._create){
                this.createNew(null);
            }
            //create new object

        } else {
            if(this._fip) return;
            this._fip = true;
            fetch(this._saveServiceUrl + '/' + this._storeId).then(resp => {
                resp.json().then(json => {
                    this.setValue(json);
                    this._fip = false;
                })
            })
        }
    }
}

define(PurrSist);