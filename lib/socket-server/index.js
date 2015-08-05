'use strict';

// external dependencies
var socketIo = require('socket.io');

function socketServer(server, app) {

  var io = socketIo(server);

  io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

}

module.exports = socketServer;