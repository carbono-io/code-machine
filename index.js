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
var config  = require('config');
var consign = require('consign');
var http    = require('http');
var express = require('express');
var ws      = require('socket.io');
var path    = require('path');

var app        = express();
app.httpServer = http.createServer(app);
app.ws         = ws(app.httpServer);

var projectDir = path.resolve(config.get('projectDir'));
var sourceDir = config.get('sourceDir');
var codeDir = path.join(projectDir, sourceDir);

app.options = {
    port: config.get('port'),
    projectDir: projectDir,
    sourceDir: sourceDir,
    codeDir: codeDir,
    // @todo get the path to carbo-inspector in a better way.
    carboInspectorPath: path.resolve(
        'node_modules/carbo-inspector/carbo-inspector.injector.html'
    ),
};

consign({cwd: 'app'})
    .include('controllers')
    .include('routes')
    .into(app);

var server = app.httpServer.listen(
    app.options.port,
    function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Code-Machine listening at http://%s:%s', host, port);
    }
);
