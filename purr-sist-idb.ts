import {set, get} from 'idb-keyval/dist/idb-keyval.mjs';

set('hello', 'world').then(() =>{
    get('hello').then((val: any) =>{
        console.log(val);
    })
})
