import { PurrSist } from './purr-sist.js';
import { define } from 'trans-render/define.js';
const save_service_url = 'save-service-url';
export class PurrSistJsonBlob extends PurrSist {
    static get is() { return 'purr-sist-jsonblob'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([save_service_url]);
    }
    //_pendingNewVals!: any[];
    attributeChangedCallback(n, ov, nv) {
        switch (n) {
            case save_service_url:
                this._saveServiceUrl = nv;
                break;
        }
        super.attributeChangedCallback(n, ov, nv);
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
            this.storeId = resp.headers.get('x-jsonblob');
            resp.json().then(json => {
                this._initInProgress = false;
                //this.storeId = json.uri.split('/').pop();
                this.dataset.newStoreId = this._storeId;
                this.de('new-store-id', {
                    value: this.storeId
                }, true);
                if (master !== null)
                    master.newVal = Object.assign(master.value, {
                        [this._guid]: this._storeId,
                    });
            });
        });
        this.value = val;
    }
    get saveServiceUrl() {
        return this._saveServiceUrl;
    }
    set saveServiceUrl(val) {
        this.attr(save_service_url, val);
    }
    saveNewVal(value) {
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
        this.propUp(['saveServiceUrl']);
        if (!this._saveServiceUrl) {
            if (this._baseLinkId) {
                this._saveServiceUrl = this.getFullURL('');
            }
            else {
                this._saveServiceUrl = 'https://jsonblob.com/api/jsonBlob';
            }
        }
        super.connectedCallback();
    }
    onPropsChange(n) {
        if (!this._saveServiceUrl)
            return;
        super.onPropsChange();
    }
    getStore() {
        if (this._fip)
            return;
        this._fip = true;
        fetch(this._saveServiceUrl + '/' + this._storeId).then(resp => {
            resp.json().then(json => {
                //json.__purrSistInit = true;
                this.value = json;
                this._fip = false;
            });
        });
    }
}
define(PurrSistJsonBlob);
