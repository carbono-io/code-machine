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
