'use strict';
var express = require('express');

function createCleanResourcesServer(options) {
  var app = express.static(options.codeDir);
  return app;
}

// Exports
module.exports = createCleanResourcesServer;
