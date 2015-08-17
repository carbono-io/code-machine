'use strict';
var express = require('express');

function createCleanResourcesServer(options) {
    var app = express();
    var staticFileServer = express.static(options.codeDir);

    app.use('/', staticFileServer);

    return app;
}

module.exports = createCleanResourcesServer;
