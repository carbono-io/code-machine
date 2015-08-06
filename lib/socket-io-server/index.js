'use strict';

// External dependencies
var DomFs    = require('dom-fs');
var socketIo = require('socket.io');

// Internal dependencies
var setupCommandListeners = require('./commands');
var setupNotifications    = require('./notifications');

/**
 * Function that sets the socket.io server.
 * Receives the basic node httpServer, as created by `http.createServer(options)`
 *
 * Expects that the domFs is in the options object.
 */
function setupSocketIoServer(httpServer, options) {
  var domFs = new DomFs(options.codeDir);

  // Let socket.io configure its own server.
  var io = socketIo(httpServer);

  io.on('connection', function (socket) {

    setupCommandListeners(socket, domFs, options);
    setupNotifications(socket, domFs, options);

  });

  // Return the socket.io instance, on which events may be emitted
  return io;
}

module.exports = setupSocketIoServer;