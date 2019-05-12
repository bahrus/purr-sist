import { XtallatX } from 'xtal-element/xtal-latx.js';
import { disabled, hydrate } from 'trans-render/hydrate.js';
import { BaseLinkId } from 'xtal-element/base-link-id.js';
import { getHost } from 'xtal-element/getHost.js';
const store_id = 'store-id';
const write = 'write';
const read = 'read';
const new$ = 'new';
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
export class PurrSist extends XtallatX(hydrate(BaseLinkId(HTMLElement))) {
    constructor() {
        //static get is() { return 'purr-sist'; }
        super(...arguments);
        this._initInProgress = false;
    }
    static get observedAttributes() {
        return ([disabled, store_id, write, read, new$, guid, master_list_id]);
    }
    attributeChangedCallback(n, ov, nv) {
        super.attributeChangedCallback(n, ov, nv);
        switch (n) {
            case store_id:
                this._storeId = nv;
                this.de('store-id', {
                    value: nv
                });
                break;
            case master_list_id:
                this._masterListId = nv;
                break;
            case guid:
                this._guid = nv;
                break;
            case new$:
            case write:
            case read:
                this['_' + n] = (nv !== null);
                break;
        }
        this.onPropsChange(n);
    }
    get storeId() {
        return this._storeId;
    }
    set storeId(val) {
        this._storeId = val;
        this.attr(store_id, val);
        if (this._newVal) {
            this.newVal = this._newVal;
        }
        this.syncMasterList();
    }
    syncMasterList() {
        if (!this._masterListId || !this._guid)
            return;
        const master = this.getMaster();
        if (!master || !master.value) {
            setTimeout(() => {
                this.syncMasterList();
            }, 50);
            return;
        }
        if (master.value[this._guid] === undefined) {
            const newVal = Object.assign(master.value, {
                [this._guid]: this._storeId
            });
            console.log(newVal);
            master.newVal = newVal;
            // master.newVal = Object.assign(master.value, {
            //     [this._guid]: this._storeId
            // })
        }
    }
    pullRecFromMaster(master) {
        if (master.value[this._guid] === undefined) {
            if (this._write) {
                this.createNew(master);
            }
        }
        else {
            this.storeId = master.value[this._guid];
        }
    }
    set refresh(val) {
        this.storeId = this._storeId;
    }
    get write() {
        return this._write;
    }
    set write(nv) {
        this.attr(write, nv, '');
    }
    get read() {
        return this._read;
    }
    set read(nv) {
        this.attr(read, nv, '');
    }
    get new() {
        return this._new;
    }
    set new(nv) {
        this.attr(new$, nv, '');
    }
    get guid() {
        return this._guid;
    }
    set guid(nv) {
        this.attr(guid, nv);
    }
    get masterListId() {
        return this._masterListId;
    }
    set masterListId(nv) {
        this.attr(master_list_id, nv);
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
        if (!this._storeId) {
            // if(!this._pendingNewVals) this._pendingNewVals = [];
            // this._pendingNewVals.push(val);
            return;
        }
        //const value = val; //this._value === undefined ? val : Object.assign(this._value, val);
        this.saveNewVal(val);
    }
    connectedCallback() {
        this.propUp(['storeId', write, read, new$, disabled, guid, 'masterListId', 'historyEvent', 'value', 'syncVal', 'newVal']);
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = val;
        this.de('value', {
            value: val
        });
    }
    getMaster() {
        const mlid = this._masterListId;
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
        if (!this._conn || this._disabled)
            return;
        //if(this._retrieve && !this._storeId) return;
        if (!this._storeId) {
            if (this._masterListId) {
                const mst = this.getMaster();
                if (!mst || !mst.value) {
                    setTimeout(() => {
                        this.onPropsChange();
                    }, 50);
                    return;
                }
                this.pullRecFromMaster(mst);
            }
            else if (this._new && this._write) {
                this.createNew(null);
            }
            //create new object
        }
        else {
            if (this._write)
                return;
            this.getStore();
        }
    }
}
// define(PurrSist);
