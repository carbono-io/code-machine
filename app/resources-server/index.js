'use strict';

// External dependencies
var express = require('express');

// Internal dependencies
var createMarkedResourcesServer = require('./marked');
var createCleanResourcesServer  = require('./clean');

// Create an sub-application for resources only
var resources = express();

/**
 * Builds up the logic for serving the resource server
 */
function createResourcesServer(options) {
  var app = express();

  // Mount the sub-servers to their respective paths
  app.use('/marked', createMarkedResourcesServer(options));
  app.use('/clean', createCleanResourcesServer(options));

  // Return the app
  return app;
}

module.exports = createResourcesServer;