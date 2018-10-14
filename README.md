[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/purr-sist)

<a href="https://nodei.co/npm/purr-sist/"><img src="https://nodei.co/npm/purr-sist.png"></a>
# purr-sist

purr-sist is a web component wrapper around the [myjson.com](http://myjson.com/) api service.  The service allows anyone to save and update a JSON document. 

NB:  This web service assumes humans have no dark side, and only act on the up and up.  Use of this web component should only be used for storing and retrieving harmless data, e.g. academic purposes.  The service URL is configurable.  One *could* create a server-side wrapper around this service, which adds validation logic, or your own service from scratch, that uses the same basic API.  The attribute / property where the alternative service can be specified is "service-url."  

## Step 1.  Initialization

If you place the web component on the page:

```html
<purr-sist persist></purr-sist>
```

since no "store-id" is specified, a new record will be created on initial load.

## Hardcoding a record

Once you have the id, you could set it / hardcode it in your markup.

```html
<purr-sist persist store-id="catnip"></purr-sist>
```

This could perhaps be useful in some cases.  Namely, if you want to centrally manage the stored settings used by all users of your web component.

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
                <purr-sist persist guid="7482dbc4-04c8-40e6-8481-07d8ee4656b7" master-list-id="myMasterList"></purr-sist>
            #EndShadowDOM
        </my-component>
    </body>
```





