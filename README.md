[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/purr-sist)

<a href="https://nodei.co/npm/purr-sist/"><img src="https://nodei.co/npm/purr-sist.png"></a>

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/purr-sist@0.0.32/dist/purr-sist-myjson.iife.min.js?compression=gzip">
# purr-sist

[Demo](https://bahrus.github.io/purr-sist-demos/Example1.html)

purr-sist-* are web component wrappers around various services used to persist (history.)state.

What follows purr-sist- indicates where the state is persisted.

For example, purr-sist-myjson persists state to the [myjson.com](http://myjson.com/) api service.  The service allows anyone to save and update a JSON document, with zero setup steps.  See discussion below about the pro's and significant con's of this service.

purr-sist-idb persists state to the local indexed db for offline storage (and potentially cross window state management).

## Syntax Reference

<!--
```
<custom-element-demo>
<template>
    <div>
        <wc-info package-name="npm install purr-sist" href="https://unpkg.com/purr-sist@0.0.33/web-components.json"></wc-info>
        <script type="module" src="https://unpkg.com/wc-info@0.0.13/wc-info.js?module"></script>
    </div>
</template>
</custom-element-demo>
```
-->

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
                <purr-sist-foo read guid="7482dbc4-04c8-40e6-8481-07d8ee4656b7" master-list-id="/myMasterList"></purr-sist-foo>
            #EndShadowDOM
        </my-component>
    </body>
```

Note the value of the master-list-id attribute starts with a /.  This is to explicitly state that the id is expected to be found outside any Shadow DOM.  The ability to reference a master list sitting inside some Shadow DOM realm is not currently supported. 

# Examples Part A -- persisting to myjson.com

## Why myjson.com?

myjson.com is easy as pie to use.  It is so simple, in fact, that it kind of mirrors the (overly?) simple api we get with the browser's history api.  One of the objectives of this component is to provide persistence of the history.state object, so myjson.com would appear to have no "impedence mismatch" with the window.history.[push|replace]State calls, which probably is not a very flattering thing to say about the window.history api.

In addition, myjson.com requires no account set up, so it just works, with zero fuss.  

## What's the problem with myjson.com?

Due to the extremely trusting nature of myjson.com, it would be quite dangerous to use in a production setting, so use of this service should be restricted to storing and retrieving harmless data, such as URL paths or public data, or for academic / prototyping purposes.

myjson.com is similar, but not nearly as powerful, as other, far more robust solutions like [Firebase](https://firebase.google.com/docs/database/rest/save-data) (or mongoDB, or countless other solutions).   Firebase's ability to save to a path, and not overwrite the entire record, is certainly quite appealing. 

I'm 99% certain that using Firebase instead of myjson.com would reduce the packet size in a fairly significant way. But I would argue that the approach of creating a master list, detailed below, helps whether you are using Firebase or myjson.com.

## Update pieces of the remote store

To send a new object to the remote store, replacing the old one, use the newVal property:

```JavaScript
const myValue = {chairman: 'meow'};
document.querySelector('purr-sist-foo').newVal = {'kitty': myValue}
```


## Example A.1 -- Time travel support (aka back button)

[See it in action](https://bahrus.github.io/purr-sist-demos/Example3.html)

Data flow is **almost** unidirectional (see tag p-u for bad code smell exception).  Markup shown below.  

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
            This doesn't update history or the remote data store, 
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

        <!-- Pass store ID up one element so history.state knows how to update the address bar.  -->
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

<!--
# history.state vs "local storage"

In the discussion that follows, we are using the phrase "local storage" quite loosely.  For reasons I don't fully understand yet, the browser api's have evolved to support multiple ways of storing data. It's possible that some of them, like the LocalStorage Api, could be viewed as a debatably useless api at this point, like the human appendix.  Or maybe not. The point is there exists storage that doesn't change as you navigate history, and storage that does.  Despite the well-acknowledge weaknesses of the current history api, it is my view that its coordination with the address bar makes it useful enough to overlook the weaknesses.

It appears that IndexedDB has the benefit of coming later (Chrome 11, only partial support in Edge), vs history (Chrome 5, IE 10), so has a much more powerful api.  

As I see it, IndexedDB (or whatever) can serve a few primary roles:

1.  "Backup" to a remote database.  There are some subcategories to consider:
    1.  Limping through a disaster or camping trip -- The case where the remote database is down, or the user goes into offline mode, but we still want to be able to view or even create new data for later upload.  Since this is a common condition that could afflict any remote persistence system, it seems most natural to create a mixin that provides helpful functionality that any back-end persistence component could utilize.
    2.  A kind of "PRPL" pattern hack -- suppose some data isn't extremely time sensitive, but is relatively expensive to retrieve, and the site is frequently visited by the same user -- if the user has visited before, that data could be cached for an initial view, and then either updated as soon as the new data becomes available, or put into storage for the next visit.  This seems like a rather obscure reason to use the local storage (fraught with risks, like if the person uses different browsers, etc).  Again, this seems like a common mixin scenario, but the functionality shouldn't be lumped with the much more common scenario above.
    3.  Note that in some lines of business, caching business data may run aground with auditing.  So support for this kind of functionality should definitely be opt-in.  So maybe this means the mixin should be used to extend the base remote datastore component.
2.  A way to maintain local application state / cache that we don't want to lose when the user clicks on the back button, but that needs to  transcend any particular generic component, even being able to leap across iframes or child windows.  Basically, something like redux (can redux be used with iframes?), but where the store is based on an api that could outlive the human appendix.  For this purpose, it would make sense to create a standalone custom element, particularly for boilerplate scenarios where repetitive, free form JavaScript could be turned into tag / attribute data.
-->