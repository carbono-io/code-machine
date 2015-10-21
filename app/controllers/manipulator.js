/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Fabrica de Aplicativos S/A
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */
'use strict';
var CM = require('../lib/code-manipulator');
var Reply = require('../lib/socket-reply');
var Message = require('carbono-json-messages');
var PRM = require('../lib/project-resource-manager');

module.exports = function (app) {

    var cm = new CM(app.options);

    this.editAttribute = function (socket) {
        var command = 'command:editAttribute';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);
            if (!message.items) {
                reply.error({code: 400, message: 'No data received'});
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

    this.insertElement = function (socket) {
        var command = 'command:insertElement';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);

            if (!message.data.items) {
                reply.error({code: 400, message: 'No data received'});
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

    this.createEntityFromSchema = function (socket) {
        var command = 'command:createEntityFromSchema';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);

            if (!message.data.items) {
                reply.error({code: 400, message: 'No data received'});
            } else {
                var data = message.data.items[0];

                cm.createEntityFromSchema(data.entityName, data.schema, reply);
            }
        });
    };

    this.bindComponentToEntity = function (socket) {
        var command = 'command:bindComponentToEntity';
        socket.on(command, function (message) {
            message = JSON.parse(message);
            var reply = new Reply(socket, command, message.id);

            if (!message.data.items) {
                reply.error({code: 400, message: 'No data received'});
            } else {
                var data = message.data.items[0];

                cm.bindComponentToEntity(
                        data.path,
                        data.entityName,
                        reply
                );
            }
        });
    };

    this.broadcastUpdates = function (socket) {
        var emitUpdate = function (data) {
            // @todo modularize this inside the socket helper lib
            var message = new Message({apiVersion: '1.0'});

            var stringified = data.element.stringify(function (el) {
                if (el.type === 'tag') {
                    el.attribs.uuid = el.uuid;
                }
            });

            message.setData({
                items: [
                    {
                        file: data.file,
                        elementUuid: data.element.uuid,
                        content: stringified,
                    },
                ],
            });

            socket.emit('control:contentUpdate', message.toJSON());
        };

        cm.registerUpdateListener(emitUpdate);
        socket.on('disconnect', cm.removeUpdateListener.bind(cm, emitUpdate));
    };

    this.registerSocket = function (socket) {
        PRM.setSocket(socket);
        socket.on('disconnect', PRM.removeSocket.bind(PRM,socket));
    };

    return this;
};
