'use strict';
var CM = require('../lib/code-manipulator');
var Reply = require('../lib/socket-reply');

module.exports = function (app) {

    var cm = new CM(app.options.codeDir);

    this.editAttribute = function (socket) {
        var command = 'command:editAttribute';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);
            if (!message.items) {
                reply.error(400, 'No data received');
            } else {
                try {
                    var data = message.items[0];
                    cm.editAttribute(data);
                    reply.success();
                } catch (e) {
                    reply.error(500, 'Insertion error', e);
                }
            }
        });
    };

    this.insertElementAtXPath = function (socket) {
        var command = 'command:insertElementAtXPath';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);

            if (!message.data.items) {
                reply.error(400, 'No data received');
            } else {
                try {
                    var data = message.data.items[0];
                    cm.insertElementAtXPath(
                        data.file,
                        data.xpath,
                        data.element,
                        reply
                    );
                } catch (e) {
                    console.log(e);
                    reply.error(500, 'Insertion error', e);
                }
            }
        });
    };

    this.insertElement = function (socket) {
        var command = 'command:insertElement';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);

            if (!message.data.items) {
                reply.error(400, 'No data received');
            } else {
                var data = message.data.items[0];
                cm.insertElement(
                        data.path,
                        data.html,
                        data.components,
                        reply
                );
            }
        });
    };

    return this;
};
