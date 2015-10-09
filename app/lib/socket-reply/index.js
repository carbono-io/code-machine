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

    this.socket.emit(eventType, message.toJSON());
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

    this.socket.emit('failure', message.toJSON());
};

module.exports = SocketReply;
