import { XtallatX, disabled } from 'xtal-latx/xtal-latx.js';
import { define } from 'xtal-latx/define.js';
import { BaseLinkId } from 'xtal-latx/base-link-id.js';
const store_id = 'store-id';
const save_service_url = 'save-service-url';
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
export class PurrSist extends BaseLinkId(XtallatX(HTMLElement)) {
    constructor() {
        super(...arguments);
        this._initInProgress = false;
    }
    static get is() { return 'purr-sist'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([store_id, save_service_url, write, read, new$, guid, master_list_id]);
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
            case save_service_url:
                this._saveServiceUrl = nv;
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
            master.newVal = {
                [this._guid]: this._storeId,
            };
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
    createNew(master) {
        if (this._initInProgress)
            return;
        const val = {};
        fetch(this._saveServiceUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(val),
        }).then(resp => {
            resp.json().then(json => {
                this._initInProgress = false;
                this.storeId = json.uri.split('/').pop();
                if (this._pendingNewVals) {
                    this._pendingNewVals.forEach(kvp => {
                        this.newVal = kvp;
                    });
                    delete this._pendingNewVals;
                }
                if (master !== null)
                    master.newVal = {
                        [this._guid]: this._storeId,
                    };
            });
        });
        this.value = val;
    }
    set refresh(val) {
        this.storeId = this._storeId;
    }
    get saveServiceUrl() {
        return this._saveServiceUrl;
    }
    set saveServiceUrl(val) {
        this.attr(save_service_url, val);
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
    //_historyEvent!: any;
    set historyEvent(val) {
        val.url = this._storeId;
        const v = val.value;
        if (!v)
            return;
        if (v.__purrSistInit) {
            delete v.__purrSistInit;
            this.value = v;
        }
        else {
            this.newVal = val.value;
        }
    }
    get newVal() {
        return this._newVal;
    }
    set newVal(val) {
        if (val === null)
            return;
        if (!this._storeId) {
            if (!this._pendingNewVals)
                this._pendingNewVals = [];
            this._pendingNewVals.push(val);
            return;
        }
        this._newVal = val;
        const value = this._value === undefined ? val : Object.assign(this._value, val);
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
            this.value = value;
        });
    }
    connectedCallback() {
        this._upgradeProperties(['storeId', 'saveServiceUrl', write, read, new$, disabled, guid, 'masterListId']);
        this.style.display = 'none';
        this._conn = true;
        if (!this._saveServiceUrl) {
            if (this._baseLinkId) {
                this._saveServiceUrl = this.getFullURL('');
            }
            else {
                this._saveServiceUrl = 'https://api.myjson.com/bins';
            }
        }
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
        if (!this._masterListId.startsWith('/'))
            throw 'Must start with "/"';
        return self[this._masterListId.substr(1)];
    }
    onPropsChange(n) {
        if (!this._conn || !this._saveServiceUrl || this._disabled)
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
            if (this._fip)
                return;
            this._fip = true;
            fetch(this._saveServiceUrl + '/' + this._storeId).then(resp => {
                resp.json().then(json => {
                    json.__purrSistInit = true;
                    this.value = json;
                    this._fip = false;
                });
            });
        }
    }
}
define(PurrSist);
//# sourceMappingURL=purr-sist.js.map