//@ts-check
const jiife = require('jiife');
const xl = 'node_modules/xtal-latx/';
jiife.processFiles([xl + 'xtal-latx.js', xl + 'define.js', xl + 'base-link-id.js', 'purr-sist.js', 'purr-sist-myjson.js'], 'dist/purr-sist-myjson.iife.js');




