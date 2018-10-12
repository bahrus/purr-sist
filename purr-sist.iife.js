
    //@ts-check
    (function () {
    const disabled = 'disabled';
/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this._evCount = {};
        }
        static get observedAttributes() {
            return [disabled];
        }
        /**
         * Any component that emits events should not do so if it is disabled.
         * Note that this is not enforced, but the disabled property is made available.
         * Users of this mix-in should ensure not to call "de" if this property is set to true.
         */
        get disabled() {
            return this._disabled;
        }
        set disabled(val) {
            this.attr(disabled, val, '');
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Turn number into string with even and odd values easy to query via css.
         * @param n
         */
        to$(n) {
            const mod = n % 2;
            return (n - mod) / 2 + '-' + mod;
        }
        /**
         * Increment event count
         * @param name
         */
        incAttr(name) {
            const ec = this._evCount;
            if (name in ec) {
                ec[name]++;
            }
            else {
                ec[name] = 0;
            }
            this.attr('data-' + name, this.to$(ec[name]));
        }
        attributeChangedCallback(name, oldVal, newVal) {
            switch (name) {
                case disabled:
                    this._disabled = newVal !== null;
                    break;
            }
        }
        /**
         * Dispatch Custom Event
         * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
         * @param detail Information to be passed with the event
         * @param asIs If true, don't append event name with '-changed'
         */
        de(name, detail, asIs) {
            const eventName = name + (asIs ? '' : '-changed');
            const newEvent = new CustomEvent(eventName, {
                detail: detail,
                bubbles: true,
                composed: false,
            });
            this.dispatchEvent(newEvent);
            this.incAttr(eventName);
            return newEvent;
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        _upgradeProperties(props) {
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = this[prop];
                    delete this[prop];
                    this[prop] = value;
                }
            });
        }
    };
}
function define(custEl) {
    let tagName = custEl.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, custEl);
}
const store_id = 'store-id';
const save_service_url = 'save-service-url';
//const new_val = 'new_val';
class PurrSist extends XtallatX(HTMLElement) {
    constructor() {
        super(...arguments);
        this._saveServiceUrl = 'https://api.myjson.com/bins';
        this._initInProgress = false;
    }
    static get is() { return 'purr-sist'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([store_id]);
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
    get newVal() {
        return this._newVal;
    }
    set newVal(val) {
        if (!this._storeId) {
            if (!this._pendingNewVals)
                this._pendingNewVals = [];
            this._pendingNewVals.push(val);
            return;
        }
        this._newVal = val;
        fetch(this._saveServiceUrl + '/' + this._storeId, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(val),
        }).then(resp => {
            this.de('newVal', {
                value: val,
            });
        });
    }
    connectedCallback() {
        this._upgradeProperties([store_id, save_service_url, 'disabled']);
        this._conn = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._conn || !this._saveServiceUrl || this._disabled)
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
                    this.value = json;
                    this.de('value', {
                        value: json
                    });
                });
            });
        }
    }
}
define(PurrSist);
    })();  
        