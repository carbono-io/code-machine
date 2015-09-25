'use strict';

var DomFs = require('dom-fs');
var path = require('path');
var config = require('config');

var projectDir = path.resolve(config.get('projectDir'));
var sourceDir = config.get('sourceDir');
var codeDir = path.join(projectDir, sourceDir);

var domFsInstance = new DomFs(codeDir);

// @todo take care of saving DomFs files periodically.

module.exports = domFsInstance;
