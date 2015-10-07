'use strict';

var config = require('config');
var path = require('path');
var fs = require('fs');
var Message = require('carbono-json-messages');

var projectDir = path.resolve(config.get('projectDir'));
var resFile = 'project_resources.json';

var ProjectResourceManager = function () {

    this.resFilePath = path.join(projectDir, resFile);
    this.resIndex = JSON.parse(fs.readFileSync(this.resFilePath));

    this.socket = null;

    return this;
};

ProjectResourceManager.prototype.setSocket = function (socket) {
    this.socket = socket;
};

ProjectResourceManager.prototype.removeSocket = function (socket) {
    if (this.socket === socket) {
        this.socket = null;
    }
};

ProjectResourceManager.prototype.getCrudRoute = function () {
    var crudAlias = 'crud-basic';
    if (!(crudAlias in this.resIndex)) {
        var crudRoute = '/crud/crud001';
        this.requestMachine(crudAlias, crudRoute);
        this.resIndex[crudAlias] = crudRoute;
    }
    return this.resIndex[crudAlias];
};

ProjectResourceManager.prototype.requestMachine = function (machine, route) {
    var msg = new Message({apiVersion: '1.0'});
    var data = {
        items: [
            {
                component: machine,
                route: route,
            },
        ],
    };
    msg.setData(data);
    this.socket.emit('project:createMachine', msg.toJSON());
};

ProjectResourceManager.prototype.saveResourceIndex = function () {
    fs.writeFileSync(this.resFilePath, JSON.stringify(this.resIndex, null, 4));
};

module.exports = new ProjectResourceManager();
