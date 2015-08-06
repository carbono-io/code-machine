'use strict';

/**
 * Sets the notifications from domFs to the socket.
 * Publishes important events.
 */
function setupNotifications(socket, domFs, options) {

  domFs.on('change', function (file) {

    socket.emit('file-changed', {
      fname: file.name
    });
  });
}