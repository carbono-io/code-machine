'use strict';
var Message = require('carbono-json-messages');

var SocketReply = function (socket, command, id) {
    this.socket = socket;
    this.command = command;
    this.id = id;
    return this;
};

SocketReply.prototype.sendData = function (eventType, data) {
    var message = new Message({apiVersion: '1.0', id: this.id});

    message.setData(data);

    this.socket.emit(this.command + '/' +  eventType, message.toJSON());
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

SocketReply.prototype.error = function (code, errorMessage, exception) {
    var message = new Message({apiVersion: '1.0', id: this.id});

    var error = {
        code: code,
        message: errorMessage,
        errors: [exception],
    };

    message.setError(error);

    this.socket.emit(this.command + '/error', message.toJSON());
};

module.exports = SocketReply;
