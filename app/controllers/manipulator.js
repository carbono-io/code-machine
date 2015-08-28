'use strict';
var CM = require('../lib/code-manipulator');

module.exports = function (app) {

    var cm = new CM(app.options.codeDir);

    this.editAttribute = function (socket) {
        socket.on('command:editAttribute', function (data) {
            if (!data) {
                socket.emit('error', {at: 'editAtt'});
            } else {
                try {
                    cm.editAttribute(data);
                } catch (e) {
                    socket.emit('error', {at: 'editAtt'});
                }
            }
            socket.emit('edited', {result: 'ok'});
        });
    };

    this.insertElementAtXPath = function (socket) {
        socket.on('command:insertElementAtXPath', function (data) {
            if (!data) {
                socket.emit('error', {at: 'editAtt'});
            } else {
                try {
                    cm.insertElementAtXPath(
                        data.file,
                        data.xpath,
                        data.element
                    );
                } catch (e) {
                    socket.emit('error', {at: 'editAtt'});
                }
            }
            socket.emit('edited', {result: 'ok'});
        });
    };

    this.insertElement = function (socket) {
        socket.on('command:insertElement', function (data) {
            var respond = function (error) {
                if (error) {
                    socket.emit('error', error);
                } else {
                    socket.emit('inserted', {});
                }
            };

            if (!data) {
                respond(new Error('no data received'));
            } else {
                cm.insertElement(
                        data.path,
                        data.html,
                        data.components,
                        respond
                );
            }
        });
    };

    return this;
};
