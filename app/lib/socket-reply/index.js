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
var Message = require('carbono-json-messages');

var SocketReply = function (socket, command, id) {
    this.socket = socket;
    this.command = command;
    this.id = id;
    return this;
};

SocketReply.prototype.sendData = function (eventType, data) {
    var message = new Message({
        apiVersion: '1.0',
        id: this.id,
        method: this.command,
    });

    message.setData(data);

    this.socket.emit('status:' + eventType, message.toJSON());
};

SocketReply.prototype.notify = function (data) {
    this.sendData('notify', data);
};

SocketReply.prototype.deliver = function (data) {
    this.sendData('deliver', data);
};

SocketReply.prototype.success = function (data) {
    this.sendData('success', data);
};

SocketReply.prototype.error = function (data) {
    console.log('Operation error: ', data);

    var message = new Message({
        apiVersion: '1.0',
        id: this.id,
        method: this.command,
    });

    var error = {
        code: data.code,
        message: data.message,
        errors: ('exception' in data ? [data.exception] : []),
    };

    message.setError(error);

    this.socket.emit('status:failure', message.toJSON());
};

module.exports = SocketReply;
