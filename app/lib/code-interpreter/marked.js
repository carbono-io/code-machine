'use strict';

// Native dependencies
var fs   = require('fs');
var path = require('path');

// External dependencies
var express = require('express');
var domFs   = require('../dom-wrapper');
var css     = require('css');

/**
 * Creates an express app for serving marked html resources
 */
function createMarkedResourcesServer(options) {

    var carboInspectorRoute = 'assets/injected/carbo-inspector.html';

    var app = express();

    // Add the starting `/` slash, because express attempts to
    // use it as a pattern with less priority than `**/*.html`
    app.get('/' + carboInspectorRoute, function (req, res) {
        fs.createReadStream(options.carboInspectorPath).pipe(res);
    });

    // First intercept get requests for .html files
    app.get('**/*.html', function (req, res) {

        var file = domFs.getFile(req.path);

        var injectImport = '<link rel="import" ';
        injectImport += 'href="';
        injectImport += carboInspectorRoute;
        injectImport += '">';

        var markedContent = file.stringify({
            elementCallback: function (element) {
                if (req.path === '/index.html' &&
                    element.type === 'tag' &&
                    element.name === 'head') {

                    element.addChild(injectImport);
                }
                if (element.type === 'tag') {
                    element.attribs['carbono-uuid'] = element.uuid;
                    element.attribs['carbono-filename'] = req.path;
                }
            },
            // Add an 'appendToHead' field and treat it in DomFs, will
            // yield better performance due to a simpler callback.
        });

        res.send(markedContent);
    });

    // Intercept '.css.json' resources
    app.get('**/*.css.json', function (req, res) {

        // get the path for the original resource
        var originalResourcePath = req.path.replace(/\.json$/, '');

        originalResourcePath = path.join(options.projectDir, options.sourceDir, originalResourcePath);

        var originalResourceContents = fs.readFileSync(originalResourcePath, 'utf-8');

        var cssObject = css.parse(originalResourceContents);

        res.json(cssObject);
    });

    // Then serve static files for all other extensions
    app.use('/', express.static(options.codeDir));

    return app;
}

// Exports
module.exports = createMarkedResourcesServer;
