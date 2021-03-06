[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/purr-sist)

<a href="https://nodei.co/npm/purr-sist/"><img src="https://nodei.co/npm/purr-sist.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/purr-sist">

# purr-sist


purr-sist-* are web component wrappers around various services used to persist (history.)state.

What follows purr-sist- indicates where the state is persisted.

For example, purr-sist-jsonblob persists state to the [jsonblob.com](http://jsonblob.com/) api service.  The service allows anyone to save and update a JSON document, with zero setup steps.  See discussion below about the pro's and significant con's of this service.

purr-sist-idb persists state to the local indexed db for offline storage (and potentially cross window state management).

**NB**:  Quite a bit of the functionality described here overlaps significantly with the slightly better known [Polymer data elements](https://www.webcomponents.org/element/@polymer/app-storage), which I remembered about recently.  At this point, there's no doubt those components support useful features not found here (like orchestrating data moving as the user's status switches between offline and online mode).   

<!--## Syntax Reference -->

<!--
```
<custom-element-demox>
<template>
    <div>
        <wc-info package-name="npm install purr-sist" href="https://unpkg.com/purr-sist@0.0.35/web-components.json"></wc-info>
        <script type="module" src="https://unpkg.com/wc-info@0.0.13/wc-info.js?module"></script>
    </div>
</template>
</custom-element-demox>
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
<purr-sist-foo write anew></purr-sist-foo>
```

since no "store-id" is specified, a new "{}" record will be created on initial load.  If you inspect the element, you will see the id of that new record reflected to the element with attribute "store-id".

Once you have the id, you *could* set it / hardcode it in your markup (after removing the "anew" attribute). 

```html
<purr-sist-foo read store-id="JCPenny"></purr-sist-foo>
```

As we will see, this can be useful in some cases, particularly for "store registries". 

## Store Registry

purr-sist adds some fundamental support for scaling large saves, so they can be broken down somewhat.  First, there is a property, guid, which stands for "globally unique identifier."  There are [many](https://duckduckgo.com/?q=online+guid+generator&t=h_&ia=web) [tools](https://marketplace.visualstudio.com/search?term=guid&target=VSCode&category=All%20categories&sortBy=Relevance) that can generate these for you. 

Second, there's a property "storeRegistryId" which specifies the id of a DOM element outside any Shadow DOM.  That DOM element should also be a purr-sist element, which serves as the  store registrar.  It contains a lookup between the guid, hardcoded in the markup (or initialization code), and the id defined by the remote datastore (jsonblob.com in this case).

So the markup can look like:

```html
    <body>
        <purr-sist-foo persist id=myStoreLiquidationRegistry store-id="asd9wg"></purr-sist-foo>
        ...
        <my-component> <!-- just an example -->
            #ShadowDOM
                <purr-sist-foo read guid="7482dbc4-04c8-40e6-8481-07d8ee4656b7" store-name=NiemanMarcus store-registry-id="/myStoreLiquidationRegistry"></purr-sist-foo>
            #EndShadowDOM
        </my-component>
        <some-other-component> <!-- just an example -->
            #ShadowDOM
                <purr-sist-foo read guid="7482dbc4-04c8-40e6-8481-07d8ee4656b8" store-name="Noah's Event Venue" store-registry-id="/myStoreLiquidationRegistry"></purr-sist-foo>
            #EndShadowDOM
        </some-other-component>
    </body>
```

Note the value of the store-registry-id attribute starts with a /.  This is to explicitly state that the id is expected to be found outside any Shadow DOM.  The ability to reference a store registry sitting inside some Shadow DOM realm is not currently supported. 

# Examples Part A -- persisting to jsonblob.com

## Why jsonblob.com?

jsonblob.com is easy as pie to use.  It is so simple, in fact, that it kind of mirrors the (overly?) simple api we get with the browser's history api.  One of the objectives of this component is to provide persistence of the history.state object, so jsonblob.com would appear to have no "impedance mismatch" with the window.history.[push|replace]State calls, which probably is not a very flattering thing to say about the window.history api.

In addition, jsonblob.com requires no account set up, so it just works, with zero fuss.  

## What's the problem with jsonblob.com?

Due to the extremely trusting nature of jsonblob.com, it would be quite dangerous to use in a production setting, so use of this service should be restricted to storing and retrieving harmless data, such as URL paths or public data, or for academic / prototyping purposes, precisely as the web site suggests.

jsonblob.com is similar, but not nearly as powerful, as other, far more robust solutions like [Firebase](https://firebase.google.com/docs/database/rest/save-data) (or mongoDB, or countless other solutions).   Firebase's ability to save to a path, and not overwrite the entire record, is certainly quite appealing. 

I'm 99% certain that using Firebase instead of jsonblob.com would reduce the packet size in a fairly significant way. But I would argue that the approach of creating a store registry, detailed below, helps whether you are using Firebase or jsonblob.com.

## Update pieces of the remote store

To send a new object to the remote store, replacing the old one, use the newVal property:

```JavaScript
const myValue = {chairman: 'meow'};
document.querySelector('purr-sist-foo').newVal = {'kitty': myValue}
```


## Example A.1 -- Time travel support (aka back button)

<!--
[See it in action](https://bahrus.github.io/purr-sist-demos/cdn.html)
-->

Data flow is **almost** unidirectional (see tag p-u for bad code smell exception).  Markup shown below.  

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div style="display:flex;flex-direction: column">
        <!-- Parse the address bar -->
        <xtal-state-parse disabled parse=location.href with-url-pattern="id=(?<storeId>[a-z0-9-]*)"></xtal-state-parse>
        <!-- If no id found in address bar, pass down ("p-d") message to session writer to create a new record ("session") -->
        <p-d on=no-match-found to=[write][-anew] val=target.noMatch  m=1></p-d>
        <!-- If id found in address bar, pass it to the persistence reader -->
        <p-d on=match-found to=[-store-id] val=target.value.storeId m=2></p-d>
        <!-- Read stored history.state from remote database if saved -->
        <purr-sist-jsonblob disabled=2 read -store-id></purr-sist-jsonblob>
        <!-- If persisted history.state found, repopulate history.state -->
        <p-d on=value-changed to=[-history] val=target.value m=1></p-d>

        
        <!-- ==========================  UI Input Fields ===================================-->
        <!-- If history.state initializes or popstates, repopulate input and artificially raise input event
        "p-h-d" stands for "pass history.state down"
        -->
        <p-h-d init-and-popstate-only to=[-value] m=1 from-path=draft.key fire-event=input></p-h-d>
        <input -value placeholder=key disabled>
        <!-- Pass key to aggregator that creates key / value object and cc history.state (draft.key) -->
        <!-- "p-w" stands for "planted weirwood" -->
        <p-w on=input to=[-key] push with-state-path=draft.key val=target.value m=1></p-w>
        
        <!-- Edit (JSON) value -->
        <!-- If history.state initializes or popstates, repopulate textarea and artificially raise input event-->
        <p-h-d init-and-popstate-only to=[-value] m=1 from-path=draft.value fire-event=input></p-h-d>
        <textarea disabled -value placeholder="value (JSON optional)"></textarea>
        <!-- Pass value  into (JSON) value to key / value aggregator and cc history.state (draft.value) -->
        <p-w on=input to=[-val] val=target.value push with-state-path=draft.value  m=1></p-w> 
       
        <!-- Combine key / value fields into one object -->
        <aggregator-fn -key -val><script nomodule>
            fn = ({ key, val }) => {
                if (key === undefined || val === undefined) return null;
                try {
                    return { [key]: JSON.parse(val) };
                } catch (e) {
                    return { [key]: val };
                }
            }
        </script></aggregator-fn>
        <!-- Pass Aggregated Object to button's "_obj" ad-hoc field -->
        <p-d on=value-changed to=button prop=_obj val=target.value m=1></p-d>
        <button>Insert Key/Value pair</button>

        <p-d on=click to=xtal-state-update[-history] with-path=submitted val=target._obj skip-init m=1></p-d>

        <!-- ============================  End UI Input fields =============================== -->
        <!-- Update global history.state object -->
        <xtal-state-update rewrite -history url-search="(?<store>(.*?))" replace-url-value="?id=$<store>" id=historyUpdater></xtal-state-update>
        <!-- Send new history.state object to object persister -->
        <p-d on=history-changed to=[-new-val]  skip-init m=1></p-d>
        <!-- Persist history.state to remote store-->   
        <purr-sist-jsonblob write -anew -new-val -store-id disabled=2></purr-sist-jsonblob>

        <!-- Pass store ID up one element so xtal-state-update knows how to update the address bar -->
        <p-u on=new-store-id to="/historyUpdater" prop=url></p-u>

        <!-- Pass history.state object to JSON viewer -->
        <p-h-d to=[-input]></p-h-d>
        <xtal-json-editor -input options={} height=300px></xtal-json-editor>
        <!-- Reload window to see if changes persist -->
        <button onclick="window.location.reload()">Reload Window</button>

        <script type="module" src="https://unpkg.com/p-et-alia@0.0.43/p-et-alia.js?module"></script>
        <script type="module" src="https://unpkg.com/xtal-state@0.0.97/xtal-state-parse.js?module"></script>
        <script type="module" src="https://unpkg.com/aggregator-fn@0.0.18/aggregator-fn.js?module"></script>
        <script type="module" src="https://unpkg.com/xtal-json-editor@0.0.39/xtal-json-editor.js?module"></script>
        <script type="module" src="https://unpkg.com/purr-sist@0.0.59/purr-sist-jsonblob.js?module"></script>
        
    </div>
</body>
</html>
```

