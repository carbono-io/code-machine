'use strict';
var express = require('express');

function createCleanResourcesServer(options) {

  var app = express();

  app.get('*', function (req, res) {

  });

  return app;
}

// Exports
module.exports = createCleanResourcesServer;
