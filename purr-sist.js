import { XtallatX } from 'xtal-latx/xtal-latx.js';
import { define } from 'xtal-latx/define.js';
// interface KVP {
//     key: string;
//     value: any;
// }
const store_id = 'store-id';
const save_service_url = 'save-service-url';
const persist = 'persist';
/**
 * `purr-sist`
 *  Custom element wrapper around http://myson.com api.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class PurrSist extends XtallatX(HTMLElement) {
    constructor() {
        super(...arguments);
        this._saveServiceUrl = 'https://api.myjson.com/bins';
        this._initInProgress = false;
    }
    static get is() { return 'purr-sist'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([store_id, save_service_url, persist]);
    }
    attributeChangedCallback(n, ov, nv) {
        super.attributeChangedCallback(n, ov, nv);
        switch (n) {
            case store_id:
                this._storeId = nv;
                break;
            case save_service_url:
                this._saveServiceUrl = nv;
                break;
            case persist:
                this._persist = (nv !== null);
                break;
        }
        this.onPropsChange();
    }
    get storeId() {
        return this._storeId;
    }
    set storeId(val) {
        this.attr(store_id, val);
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
    get persist() {
        return this._persist;
    }
    set persist(nv) {
        this.attr(persist, nv, '');
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
        });
    }
    connectedCallback() {
        this._upgradeProperties(['storeId', 'saveServiceUrl', persist, 'disabled']);
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
    }
    setValue(val) {
        this.value = val;
        this.de('value', {
            value: val
        });
    }
    onPropsChange() {
        if (!this._conn || !this._saveServiceUrl || this._disabled || !this._persist)
            return;
        if (!this._storeId) {
            //create new object
            if (this._initInProgress)
                return;
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
                    if (this._pendingNewVals) {
                        this._pendingNewVals.forEach(kvp => {
                            this.newVal = kvp;
                        });
                        delete this._pendingNewVals;
                    }
                });
            });
        }
        else {
            fetch(this._saveServiceUrl + '/' + this._storeId).then(resp => {
                resp.json().then(json => {
                    this.setValue(json);
                });
            });
        }
    }
}
define(PurrSist);
//# sourceMappingURL=purr-sist.js.map