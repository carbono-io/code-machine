'use strict';
module.exports = function (app) {

    var manipulator = app.controllers.manipulator;

    app.ws
        .on('connection', function (socket) {
            manipulator.editAttribute(socket);
            manipulator.insertElement(socket);
            manipulator.createEntityFromSchema(socket);
            manipulator.broadcastUpdates(socket);
        });

    return this;
};
