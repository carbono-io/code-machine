'use strict';
var fs   = require('fs');
var path = require('path');
var config = require('config');

require('chai').should();
var request = require('request');
var css     = require('css');

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

    it('Serves **/*.css.json files that are the JSON version of the stylesheet', function (done) {

        var stylesheetPath = 'style/test.css';
        var reqPath = path.join(markedPath, stylesheetPath + '.json');

        request(serverUrl + reqPath, function (err, res) {
            res.body.should.not.be.false;

            var contents = fs.readFileSync(path.join(codeDir, stylesheetPath), 'utf-8');
            var cssJSON = JSON.stringify(css.parse(contents));

            res.body.should.eql(cssJSON);

            // finish test
            done();
        });
    });

});
