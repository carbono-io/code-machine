'use strict';

var DomFs = require('dom-fs');
var config = require('config');

var domFsInstance = new DomFs(config.get('codeDir'));

// @todo take care of saving DomFs files periodically.

module.exports = domFsInstance;
