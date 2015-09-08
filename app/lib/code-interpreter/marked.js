'use strict';

// External dependencies
var express = require('express');
var domFs = require('../dom-wrapper');

/**
 * Creates an express app for serving marked html resources
 */
function createMarkedResourcesServer(options) {

    var app = express();

    // First intercept get requests for .html files
    app.get('**/*.html', function (req, res) {

        var file = domFs.getFile(req.path);

        var markedContent = file.stringify({
            elementCallback: function (element) {
                if (element.type === 'tag') {
                    element.attribs['x-path'] = element.getXPath();
                }
            },
        });

        res.send(markedContent);
    });

    // Then serve static files for all other extensions
    app.use('/', express.static(options.codeDir));

    return app;
}

// Exports
module.exports = createMarkedResourcesServer;
