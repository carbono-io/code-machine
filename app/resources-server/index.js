'use strict';

// External dependencies
var express = require('express');

// Internal dependencies
var createMarkedResourcesServer = require('./marked');
var createCleanResourcesServer  = require('./clean');

/**
 * Builds up the logic for serving the resource server
 */
function createResourcesServer(options) {
  var app = express();

  // Mount the sub-servers to their respective paths
  app.use('/marked', createMarkedResourcesServer(options));
  app.use('/clean', createCleanResourcesServer(options));

  app.use('/clean', logErrors);

  function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
  }

  // Return the app
  return app;
}

module.exports = createResourcesServer;