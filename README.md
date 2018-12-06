[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/purr-sist)

<a href="https://nodei.co/npm/purr-sist/"><img src="https://nodei.co/npm/purr-sist.png"></a>

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/purr-sist@0.0.32/dist/purr-sist-myjson.iife.min.js?compression=gzip">
# purr-sist

[Demo](https://bahrus.github.io/purr-sist-demos/Example1.html)

purr-sist-* are web component wrappers around various services used to persist (history.)state.

What follows purr-sist- indicates where the state is persisted.

For example, purr-sist-myjson persists state to the [myjson.com](http://myjson.com/) api service.  The service allows anyone to save and update a JSON document, with zero setup steps.  See discussion below about the pro's and significant con's of this service.

[TODO]:  purr-sist-idb persists state to the local indexed db for offline storage (and potentially cross window state management).

## Basic Syntax

purr-sist has two modes:

```html
<purr-sist-foo read></purr-sist-foo>
<purr-sist-foo write></purr-sist-foo>
```

The first tag ("read") above will only read from the remote store.  The second will only write.  One tag cannot serve both roles.

The write mode tag cannot retrieve existing data on its own.  It must be passed a record (if one exists) from the read mode tag.

If you place write mode tag on the page with the new attribute:

```html
<purr-sist-foo write new></purr-sist-foo>
```

since no "store-id" is specified, a new "{}" record will be created on initial load.  If you inspect the element, you will see the id of that new record reflected to the element with attribute "store-id".

Once you have the id, you *could* set it / hardcode it in your markup (after removing the create attribute). 

```html
<purr-sist-foo read store-id="catnip"></purr-sist-foo>
```

As we will see, this can be useful in some cases, particularly for "master lists". 

## Master Index

purr-sist adds some fundamental support for scaling large saves, so they can be broken down somewhat.  First, there is a property, guid, which stands for "globally unique identifier."  There are [many](https://duckduckgo.com/?q=online+guid+generator&t=h_&ia=web) [tools](https://marketplace.visualstudio.com/search?term=guid&target=VSCode&category=All%20categories&sortBy=Relevance) that can generate these for you. 

Second, there's a property "master-list-id" which specifies the id of a DOM element outside any Shadow DOM.  That DOM element should also be a purr-sist element, which serves as the master list indexer.  It contains a lookup between the guid, hardcoded in the markup (or initialization code), and the id defined by the remote datastore (myjson.com in this case).

So the markup can look like:

```html
    <body>
        <purr-sist-foo persist id="myMasterList" store-id="asd9wg"></purr-sist-foo>
        ...
        <my-component> <!-- just an example -->
            #ShadowDOM
                <purr-sist read guid="7482dbc4-04c8-40e6-8481-07d8ee4656b7" master-list-id="/myMasterList"></purr-sist>
            #EndShadowDOM
        </my-component>
    </body>
```

Note that the value of the master-list-id attribute starts with a /.  This is to explicitly state that the id is expected to be found outside any Shadow DOM.  The ability to reference a master list sitting inside some Shadow DOM realm is not currently supported. 

# Examples Part A -- persisting to myjson.com

## Why myjson.com?

myjson.com is easy as pie to use.  It is so simple, in fact, that it kind of mirrors the (overly?) simple api we get with the browser's history api.  One of the objectives of this component is to provide persistence of the history.state object, so myjson.com would appear to have no "impedence mismatch" with the window.history.[push|replace]State calls, which probably is not a very flattering thing to say about the window.history api.

In addition, myjson.com requires no account set up, so it just works, with zero fuss.  

## What's the problem with myjson.com?

Due to the extremely trusting nature of myjson.com, it would be quite dangerous to use in a production setting, so use of this default service should be restricted to storing and retrieving harmless data, such as URL paths or public data, or for academic / prototyping purposes.

myjson.com is similar, but not nearly as powerful, as other, far more robust solutions like [Firebase](https://firebase.google.com/docs/database/rest/save-data) (or mongoDB, or countless other solutions).   Firebase's ability to save to a path, and not overwrite the entire record, is certainly quite appealing. 

I'm 99% certain that using Firebase instead of myjson.com would reduce the packet size in a fairly significant way. But I would argue that the approach of creating a master list, detailed below, helps whether you are using Firebase or myjson.com.

So we will endeavor to define the "api" for this web component in such a way that it can work well with simple services like myjson.com, and also "scale up" to more sophisticed REST API's like Firebase, and achieve better performance (even while complicating the setup).

Since the api's for production-ready services differ somewhat from myjson's, we'll give a different tag name depending on the service, e.g. purr-sist-firebase for Firebase's api, and possibly others as time permits. [TODO]

## Update pieces of the remote store

To send a new object to the remote store, replacing the old one, use the newVal property:

```JavaScript
const myValue = {chairman: 'meow'};
document.querySelector('purr-sist-foo').newVal = {'kitty': myValue}
```


## Example A.1 -- Time travel support (aka back button)

[See it in action](https://bahrus.github.io/purr-sist-demos/Example3.html)

Data flow **almost** unidirectional (see tag p-u for bad code smell exception).  Markup shown below.  

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Example 3</title>
</head>

<body>
    <div style="display:flex;flex-direction: column">

        <!-- Parse the address bar -->
        <xtal-state-parse disabled="3" parse="location.href" level="global" 
            with-url-pattern="id=(?<storeId>[a-z0-9-]*)">
        </xtal-state-parse>

        <!-- If no id found in address bar, "pass-down (p-d)" message to 
            purr-sist-myjson writer and 
            xtal-state-update history initializer  
            to create a new record ("session") in 
            both history and remote store -->
        <p-d on="no-match-found" to="purr-sist-myjson[write],xtal-state-update[init]" 
            prop="new" val="target.noMatch"  m="2" skip-init></p-d>

        <!-- If id found in address bar, pass it to 
            the persistence reader if history is null -->
        <p-d on="match-found" if="[data-history-was-null]" to="purr-sist-myjson[read]" 
            prop="storeId" val="target.value.storeId" m="1" skip-init></p-d>

        <!-- If id found in address bar, pass it to the 
            persistence writer whether or not history is null -->
        <p-d on="match-found" to="purr-sist-myjson[write]" prop="storeId" 
        val="target.value.storeId" m="1" skip-init></p-d>

        <!-- Read stored history.state from remote database if 
            id found in address bar and history starts out null -->
        <purr-sist-myjson read disabled></purr-sist-myjson>

        <!-- If persisted history.state found, 
            repopulate history.state from remote store -->
        <p-d on="value-changed" prop="history" val="target.value"></p-d>
        <xtal-state-update init rewrite level="global"></xtal-state-update>

        <!-- Watch for initial history state or popstate events, 
            populate UI components
             that need to initialize when these events occur.
         -->
        <xtal-state-watch disabled="3" watch="popstate" level="global"></xtal-state-watch>

        <!-- ====== initialize key input field ===== -->
        <p-d on="history-changed" to="input" prop="value" val="target.history.draft.key" m="1" skip-init></p-d>
        <!-- ====== initialize textarea (JSON) field ====== -->
        <p-d on="history-changed" to="textarea" prop="value" val="target.history.draft.value" m="1" skip-init></p-d>

        <!--  ====== Sync up purr-sist[write] with history. 
            This doesn't update history or the persistence, 
            but downstream elements to the persistence writer 
            are notified as if it is  -->
        <p-d on="history-changed"  to="purr-sist-myjson[write]" prop="syncVal" val="target.history" m="1" skip-init></p-d>

        <!-- ==========================  UI Input Fields ===================================-->
        <!-- Add a new key (or replace existing one) -->
        <input type="text" disabled="2" placeholder="key">
        <!-- Save key to history.draft.key -->
        <p-d-x on="input" to="xtal-state-update" prop="history.draft.key" val="target.value" m="1" skip-init></p-d-x>
        <!-- Pass key to aggregator that creates key / value object -->
        <p-d on="input" to="aggregator-fn" prop="key" val="target.value" m="1"></p-d>

        <!-- Edit (JSON) value -->
        <textarea disabled="2" placeholder="value (JSON optional)"></textarea>
        <!-- Pass value to history.draft.value -->
        <p-d-x on="input" to="xtal-state-update" prop="history.draft.value" val="target.value" m="1" skip-init></p-d-x>
        <!-- Pass (JSON) value to key / value aggregator -->
        <p-d on="input" prop="val" val="target.value"></p-d>
        <!-- ============================  End UI Input fields =============================== -->
    
        <!-- Combine key / value fields into one object -->
        <aggregator-fn disabled><script nomodule>
        ({ key, val }) => {
            if (key === undefined || val === undefined) return null;
            try {
                return { [key]: JSON.parse(val) };
            } catch (e) {
                return { [key]: val };
            }
        }
        </script></aggregator-fn>
        <!-- Pass Aggregated Object to button's "obj" property -->
        <p-d on="value-changed" to="button" prop="obj" val="target.value" m="1"></p-d>
         
        <button disabled>Insert Key/Value pair</button>
        <!-- Pass button's "obj" property to history via 
            history-state-update
        -->
        <p-d-x on="click" to="xtal-state-update" prop="history.submitted" val="target.obj" skip-init m="1"></p-d-x>

        <!-- Update (merge) into global history.state 
            object the new submitted object -->
        <xtal-state-update id="historyUpdater" disabled make level="global" 
            url-search="(?<store>(.*?))" replace-url-value="?id=$<store>">
        </xtal-state-update>

        <!-- Send new history.state object to object persister -->
        <p-d on="history-changed" prop="newVal"  skip-init></p-d>

        <!-- Persist history.state to remote store-->   
        <purr-sist-myjson write disabled></purr-sist-myjson>

        <!-- Pass store ID up one element so hist-->
        <p-u on="new-store-id" to="historyUpdater" prop="url"></p-u>

        <!-- Pass persisted object to JSON viewer -->
        <p-d on="value-changed" prop="input" ></p-d>
        <xtal-json-editor options="{}" height="300px"></xtal-json-editor>
        
        <!-- Reload window to see if changes persist -->
        <button onclick="window.location.reload()">Reload Window</button>

        <script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/purr-sist@0.0.32/dist/purr-sist-myjson.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/p-d.p-u@0.0.92/dist/p-all.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/xtal-json-editor@0.0.29/xtal-json-editor.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/aggregator-fn@0.0.11/aggregator-fn.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/xtal-state@0.0.59/dist/xtal-state.iife.js"></script>
    </div>
</body>
</html>
```
