//@ts-check
const jiife = require('jiife');
const xl = 'node_modules/xtal-latx/';
jiife.processFiles([xl + 'xtal-latx.js', xl + 'define.js', 'purr-sist.js'], 'purr-sist.iife.js');



