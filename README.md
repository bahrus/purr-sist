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

Once you have the id, you could set it / harcode it in your markup.  This would allow page refreshes not to lose the last values:

```html
<purr-sist store-id="catnip"></purr-sist>
```

This could perhaps be useful in some cases.  Namely, if you want to centrally manage the stored settings used by all users of your web component.

## Modifying a property in the remote store

To insert / update a property in the remote store, use the newVal property:

```JavaScript
const myValue = {chairman: 'meow'};
document.querySelector('purr-sist').newVal = {'kitty': myValue}
```

