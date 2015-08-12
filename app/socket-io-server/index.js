'use strict';

// External dependencies
var DomFs    = require('dom-fs');
var socketIo = require('socket.io');
var _        = require('lodash');

// Internal dependencies
var commands  = require('./commands');



/**
 * Function that sets up listeners on the socketIo server.
 */
function setupCommandListeners(socket, domFs, options) {
  socket.on('command:editAttribute', _.partial(commands.editAttribute, domFs))
  socket.on('command:insertElementAtXPath', _.partial(commands.insertElementAtXPath, domFs));
}

/**
 * Sets the notifications from domFs to the socket.
 * Publishes important events.
 */
function setupNotifications(socket, domFs, options) {

  // domFs.on('change', function (file) {

  //   socket.emit('file-changed', {
  //     fname: file.name
  //   });
  // });
}


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

  // On connection set up listeners
  io.on('connection', function (socket) {

    setupCommandListeners(socket, domFs, options);
    setupNotifications(socket, domFs, options);

  });

  // Return the socket.io instance, on which events may be emitted
  return io;
}

module.exports = setupSocketIoServer;
