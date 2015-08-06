'use strict';

// External dependencies
var _ = require('lodash');

/**
 * Performs an attribute edition.
 */
function editAttribute(domFs, options) {

}

function insertElementAtXPath(domFs, options) {

}


/**
 * Function that sets up listeners on the socketIo server.
 */
function setupCommandListeners(socket, domFs, options) {

  socket.on('command:editAttribute', _.partial(editAttribute, domFs))

  socket.on('command:insertElementAtXPath', _.partial(insertElementAtXPath, domFs));
}



module.exports = setupCommandListeners;
