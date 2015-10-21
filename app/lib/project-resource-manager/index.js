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
