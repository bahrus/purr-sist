[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/purr-sist)

<a href="https://nodei.co/npm/purr-sist/"><img src="https://nodei.co/npm/purr-sist.png"></a>
# purr-sist

[Demo](https://unpkg.com/purr-sist@0.0.8/demo/index.html?id=11wwg0)

NB:  This is a highly experimental web component, subject to dramatic changes.  

purr-sist is a web component wrapper to a generic RESTful API, which defaults, for now, to the [myjson.com](http://myjson.com/) api service.  The service allows anyone to save and update a JSON document. 

## Basic Syntax

If you place the web component on the page:

```html
<purr-sist persist></purr-sist>
```

since no "store-id" is specified, a new record will be created on initial load.  If you inspect the element, you will see that id reflected with attribute store-id.

Once you have the id, you *could* set it / hardcode it in your markup. 

```html
<purr-sist persist store-id="catnip"></purr-sist>
```

As we will see, this can be useful in some cases. 

## Why myjson?

myjson.com is similar, but not nearly as powerful, as other, far more robust solutions like [Firebase](https://firebase.google.com/docs/database/rest/save-data).  In particular, Firebases's ability to save to a path, and not overwrite the entire record, is certainly quite appealing. 

In contrast, myjson.com is quite rudimentary.  It is so simple, in fact, that it kind of mirrors the (overly?) simple api we get with the browser's history api.  One of the objectives of this component is to provide persistence of the history.state object, so myjson.com would appear to have no "impedence mismatch" with the window.history.[push|replace]State calls.

As this web component matures, it may very well "outgrow" the capabilities of myjson, but in the spirit of KISS, we'll wait and see.

In addition, myjson requires no account set up, so it just works, with zero fuss.  Using it in a production setting, though, is quite dangerous for this very reason, so use of this web component should be restricted to storing and retrieving harmless data, such as URL paths or public data, or for academic purposes.  

One could provide a more secure proxy wrapper around myjson.com, which adds user id / entitlement logic / hash checks.

To specify your own service, add a link preconnect tag to the page, and give it some id

```html
<head>
    ...
    <link rel="preconnect" id="yourSecurePersistanceService" href="https://yourjson.com/">
    ...
</head>
```

Then specify that for those tags where you want better security than the one myson.com provides:

```html
<purr-sist base-link-id="yourSecurePersistanceService"></purr-sist>
```


## Send a new object to the remote store

To send a new object to the remote store, use the newVal property:

```JavaScript
const myValue = {chairman: 'meow'};
document.querySelector('purr-sist').newVal = {'kitty': myValue}
```

<!--
```
<custom-element-demo>
  <template>
    <div data-pd style="display:flex;flex-direction: column">
        <pass-down></pass-down>
        <input type="text" placeholder="key" data-on="input: pass-to:aggregator-fn{key:target.value}{1}">
        <textarea placeholder="value (JSON optional)" data-on="input: pass-to:aggregator-fn{val:target.value}{1}"></textarea>
        <aggregator-fn data-on="value-changed: pass-to-next:{obj:target.value}">
            <script nomodule>
                ({ key, val }) => {
                    if (key === undefined || val === undefined) return null;
                    if (val.startsWith('{') || val.startsWith('[')) {
                        try{
                            return { [key]: JSON.parse(val) };
                        }catch(e){
                            return null;
                        }
                        
                    }
                    return { [key]: val };
                }
            </script>
        </aggregator-fn>
        <button data-on="click: pass-to:purr-sist{newVal:target.obj} skip-init">Insert Key/Value pair</button>
        <purr-sist data-on="value-changed: pass-to-next:{input:target.value}"></purr-sist>
        <xtal-json-editor options="{}" height="300px"></xtal-json-editor>
        <button onclick="window.location.reload()">Reload Window</button>
        <script>
            const ps = document.querySelector('purr-sist');
            ps.addEventListener('value-changed', e => {
                window.history.replaceState(e.target.value, '', '?id=' + e.target.storeId);
            });
            const sp = new URLSearchParams(location.search);
            const storeId = sp.get('id');
            if (storeId) {
                ps.storeId = storeId;
            }
            ps.persist = true;
        </script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/purr-sist@0.0.6/purr-sist.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/pass-down@0.0.10/pass-down.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/xtal-json-editor@0.0.29/xtal-json-editor.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/aggregator-fn@0.0.10/aggregator-fn.iife.js"></script>
    </div>
  </template>
</custom-element-demo>
```
-->

## Master Index

purr-sist adds some support for scaling large saves, so they can be broken down somewhat.  First, there is a property, guid, which stands for "globally unique identifier."  There are [many](https://duckduckgo.com/?q=online+guid+generator&t=h_&ia=web) [tools](https://marketplace.visualstudio.com/search?term=guid&target=VSCode&category=All%20categories&sortBy=Relevance) that can generate these for you. 

Second, there's a property "master-list-id" which specifies the id of a DOM element outside any Shadow DOM.  That DOM element should also be a purr-sist element, which serves as the master list indexer.  It conatains a lookup between the guid, hardcoded in the markup, and the id defined by the remote datastore (myjson.com in this case).

So the markup can look like:

```html
    <body>
        <purr-sist persist id="myMasterList" store-id="asd9wg">
        ...
        <my-component> <!-- just an example -->
            #ShadowDOM
                <purr-sist persist guid="7482dbc4-04c8-40e6-8481-07d8ee4656b7" master-list-id="/myMasterList"></purr-sist>
            #EndShadowDOM
        </my-component>
    </body>
```

Note that the value of the master-list-id attribute starts with a /.  This is to explicitly state that the id is expected to be found outside any Shadow DOM.  The ability to reference a master list sitting inside some Shadow DOM realm is not currently supported. 





