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

// External dependencies
var express = require('express');
var domFs = require('../dom-wrapper');
var fs = require('fs');

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

    // Then serve static files for all other extensions
    app.use('/', express.static(options.codeDir));

    return app;
}

// Exports
module.exports = createMarkedResourcesServer;
