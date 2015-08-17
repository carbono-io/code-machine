'use strict';
var fs   = require('fs');
var path = require('path');
var config = require('config');

require('chai').should();
var request = require('request');
var DomFs   = require('dom-fs');

var port = config.get('port');

var serverUrl = 'http://localhost:' + port;
var projectDir = path.join(__dirname, 'testServer');

var cleanPath  = '/resources/clean';
var markedPath = '/resources/marked';

var utf8 = {encoding: 'utf-8'};

describe('Clean resources server', function () {

    it('Serves the clean files', function (testDone) {

        var reqPath = path.join(cleanPath, 'index.html');
        request(serverUrl + reqPath, function (err, res) {

            var fileContents = fs.readFileSync(
                path.join(projectDir, 'index.html'),
                utf8
            );

            res.body.should.eql(fileContents);

            testDone();
        })
        .on('error', function (e) {
            testDone(e);
        });

    });
});

describe('Marked resources server', function () {

    it('Serves .html files with x-path marcations', function (testDone) {

        var domFs = new DomFs(projectDir);

        var reqPath = path.join(markedPath, 'index.html');
        request(serverUrl + reqPath, function (err, res) {

            domFs.getFile('index.html')
                .stringify(function (element) {
                    if (element.type === 'tag') {
                        element.attribs['x-path'] = element.getXPath();
                    }
                })
                .should.eql(res.body);

            testDone();
        }).on('error', function (e) {
            testDone(e);
        });

    });

    it('Serves .js files without modification', function (testDone) {

        var scriptPath = 'scripts/test.js';
        var reqPath  = path.join(markedPath, scriptPath);

        request(serverUrl + reqPath, function (err, res) {

            res.body.should.not.be.false;

            fs.readFileSync(path.join(projectDir, scriptPath), utf8)
                .should.eql(res.body);

            testDone();

        }).on('error', function (err) {
            testDone(err);
        });

    });

    it('Serves .css files without modification', function (testDone) {

        var stylesheetPath = 'style/test.css';
        var reqPath = path.join(markedPath, stylesheetPath);

        request(serverUrl + reqPath, function (err, res) {

            res.body.should.not.be.false;

            fs.readFileSync(path.join(projectDir, stylesheetPath), utf8)
                .should.eql(res.body);

            testDone();

        }).on('error', function (err) {
            testDone(err);
        });

    });

});
