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
var fs   = require('fs');
var path = require('path');
var config = require('config');

require('chai').should();
var request = require('request');

var port = config.get('port');

var serverUrl = 'http://localhost:' + port;
var codeDir = path.join(__dirname, 'testServer', 'src');

var cleanPath  = '/resources/clean';
var markedPath = '/resources/marked';

var utf8 = {encoding: 'utf-8'};

describe('Clean resources server', function () {

    it('Serves the clean files', function (done) {

        var reqPath = path.join(cleanPath, 'index.html');
        request(serverUrl + reqPath, function (err, res) {

            var fileContents = fs.readFileSync(
                path.join(codeDir, 'index.html'),
                utf8
            );

            res.body.should.eql(fileContents);

            done();
        })
        .on('error', function (e) {
            done(e);
        });

    });
});

describe('Marked resources server', function () {

    it('Serves .html files with x-path marcations', function (done) {

        var reqPath = path.join(markedPath, 'index.html');
        request(serverUrl + reqPath, function (err, res) {

            res.should.not.be.empty;

            done();
        }).on('error', function (e) {
            done(e);
        });

    });

    it('Serves .js files without modification', function (done) {

        var scriptPath = 'scripts/test.js';
        var reqPath  = path.join(markedPath, scriptPath);

        request(serverUrl + reqPath, function (err, res) {

            res.body.should.not.be.false;

            fs.readFileSync(path.join(codeDir, scriptPath), utf8)
                .should.eql(res.body);

            done();

        }).on('error', function (err) {
            done(err);
        });

    });

    it('Serves .css files without modification', function (done) {

        var stylesheetPath = 'style/test.css';
        var reqPath = path.join(markedPath, stylesheetPath);

        request(serverUrl + reqPath, function (err, res) {

            res.body.should.not.be.false;

            fs.readFileSync(path.join(codeDir, stylesheetPath), utf8)
                .should.eql(res.body);

            done();

        }).on('error', function (err) {
            done(err);
        });

    });

    it('Serves the injected carbo-inspector html', function (done) {

        var reqPath = '/assets/injected/carbo-inspector.html';

        request(serverUrl + markedPath + reqPath, function (err, res) {
            res.statusCode.should.eql(200);
            done();
        }).on('error', function (err) {
            done(err);
        });
    });

});
