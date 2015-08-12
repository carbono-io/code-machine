'use strict';
module.exports = function (app) {

    var manipulator = app.controllers.manipulator;

    app.ws
        .on('connection',
            function (socket) {
                manipulator.editAttribute(socket);
                manipulator.insertElementAtXPath(socket);
            }
        );

    return this;
};