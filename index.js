'use strict';
// native dependencies
var http = require('http');

// external dependencies
var express  = require('express');

// internal dependencies
var socketServer = require('./lib/socket-server');
var resourceServer = require('./lib/resource-server');

// instantiate an application
var app    = express();
var server = http.createServer(app).listen(8000, onServerStarted);

socketServer(server, app);
resourceServer(server, app);

function onServerStarted() {
  var port = server.address().port;
  console.log('listening at port %s', port)
}