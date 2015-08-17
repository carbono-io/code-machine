'use strict';
var config  = require('config');
var consign = require('consign');
var http    = require('http');
var express = require('express');
var ws      = require('socket.io');

var app        = express();
app.httpServer = http.createServer(app);
app.ws         = ws(app.httpServer);

app.options = {
    port: config.get('port'),
    codeDir: config.get('codeDir'),
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
