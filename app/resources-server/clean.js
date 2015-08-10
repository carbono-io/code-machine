'use strict';
// Native dependencies
var path = require('path');
var fs   = require('fs');

// External dependencies
var express = require('express');

function createCleanResourcesServer(options) {
  var app = express();
  var staticFileServer = express.static(options.codeDir);

  app.use('/', staticFileServer);
  
  return app;
}

// Exports
module.exports = createCleanResourcesServer;
