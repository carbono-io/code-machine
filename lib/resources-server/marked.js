'use strict';

// External dependencies
var express = require('express');
var DomFs   = require('dom-fs');

/**
 * Creates an express app for serving marked html resources
 */
function createMarkedResourcesServer(options) {

  var domFs = new DomFs(options.codeDir);

  var app = express();

  app.get('**/*.html', function (req, res) {

  });

  return app;
}

// Exports
module.exports = createMarkedResourcesServer;
