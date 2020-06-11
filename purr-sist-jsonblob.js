import { PurrSist, bool, notify, obj, str } from './purr-sist.js';
import { define, de } from 'xtal-element/xtal-latx.js';
import { getFullURL } from 'xtal-element/base-link-id.js';
let PurrSistJsonBlob = /** @class */ (() => {
    class PurrSistJsonBlob extends PurrSist {
        createNew(master) {
            if (this._initInProgress || this.saveServiceUrl === undefined)
                return;
            this._initInProgress = true;
            const val = {};
            fetch(this.saveServiceUrl, {
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
                    this.dataset.newStoreId = this.storeId;
                    this[de]('new-store-id', {
                        value: this.storeId
                    }, true);
                    if (master !== null)
                        master.newVal = Object.assign(master.value, {
                            [this.guid]: this.storeId,
                        });
                });
            });
            this.value = val;
        }
        saveNewVal(value) {
            if (this.saveServiceUrl === undefined || this.storeId === undefined)
                return;
            fetch(this.saveServiceUrl + '/' + this.storeId, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'PUT',
                body: JSON.stringify(value),
            }).then(resp => {
                this.value = value;
            });
        }
        connectedCallback() {
            if (!this.saveServiceUrl) {
                if (this.baseLinkId !== undefined) {
                    this.saveServiceUrl = getFullURL(this, '');
                }
                else {
                    this.saveServiceUrl = 'https://jsonblob.com/api/jsonBlob';
                }
            }
            super.connectedCallback();
        }
        getStore() {
            if (this._fip)
                return;
            if (this.saveServiceUrl === undefined || this.storeId === undefined)
                return;
            this._fip = true;
            fetch(this.saveServiceUrl + '/' + this.storeId).then(resp => {
                resp.json().then(json => {
                    this.value = json;
                    this._fip = false;
                });
            });
        }
    }
    PurrSistJsonBlob.is = 'purr-sist-jsonblob';
    PurrSistJsonBlob.attributeProps = ({ saveServiceUrl, baseLinkId }) => ({
        str: [saveServiceUrl, baseLinkId, ...str],
        bool: bool,
        notify: notify,
        obj: obj,
        reflect: [saveServiceUrl, baseLinkId, ...str, ...bool]
    });
    return PurrSistJsonBlob;
})();
export { PurrSistJsonBlob };
define(PurrSistJsonBlob);
