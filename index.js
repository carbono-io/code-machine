'use strict';
// Native dependencies
var http = require('http');

// External dependencies
var express = require('express');
var _       = require('lodash');

// Internal dependencies
var setupSocketIoServer   = require('./lib/socket-io-server');
var createResourcesServer = require('./lib/resources-server');

// Constants
var SERVICE_DESCRIPTION_OPTIONS = ['port', 'codeDir'];

/**
 * Creates a new instance of CodeMachine
 * Takes as options:
 *  - port
 */
function startCodeMachineService(options) {
  var port    = options.port;    // the port at which the service will be located
  var codeDir = options.codeDir; // the absolute path at which the project is located

  if (!port) {
    throw new Error('No port for code-machine');
  }

  if (!codeDir) {
    throw new Error('No codeDir for code-machine');
  }

  // Create an express app
  var app = express();

  // Instantiate the ResourcesServer
  // As it is an express app, it has to be passed to 
  // the http.createServer as an callback.
  var resourcesServer = createResourcesServer(options);

  // Mount the resourcesServer onto a route of the main app
  app.use('/resources', resourcesServer);

  // Service description route
  app.get('/', function (req, res) {

    var serviceDescription = _.pick(options, SERVICE_DESCRIPTION_OPTIONS);

    res.json(serviceDescription);
  });

  // Instantiate an httpServer and pass the main express app as argument
  var httpServer = http.createServer(app);

  // Socket io works directly with the http server
  // so we need to pass the server to it.
  setupSocketIoServer(httpServer, options);

  // Start listening to requests
  httpServer.listen(port, function onServerStarted() {
    var port = httpServer.address().port;
    console.log('Listening at port %s', port);
  });
}

// Export the function that instantiates the CodeMachine
module.exports = startCodeMachineService;