var fs   = require('fs');
var path = require('path');
var config = require('config');

require('chai').should();
var request = require('request');
var DomFs   = require('dom-fs');

var port = config.get('port');

var serverUrl = 'http://localhost:' + port;
var testCodeProjectDir = path.join(__dirname, 'testServer')

var cleanPath  = '/resources/clean';
var markedPath = '/resources/marked';

describe('Clean resources server', function () {

    it('Serves the clean files', function (testDone) {

        var reqPath = path.join(cleanPath, 'index.html');
        request(serverUrl + reqPath, function (err, res) {

            // original content
            var fileContents = fs.readFileSync(
                path.join(testCodeProjectDir, 'index.html'),
                {encoding: 'utf8'}
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

        var domFs = new DomFs(testCodeProjectDir);

        var reqPath = path.join(markedPath, 'index.html');
        request(serverUrl + reqPath, function (err, res) {

            // read the file with domFs.
            domFs.getFile('index.html')
                .stringify(function (element) {
                    // Only mark tag elements
                    if (element.type === 'tag') {
                        element.attribs['x-path'] = element.getXPath();
                    }
                })
                .should.eql(res.body);

            testDone();
        }).on('error', function (e) {
            testDone(e)
        });

    });

    it('Serves .js files without modification', function (testDone) {

        var scriptPath = 'scripts/test.js';
        var reqPath  = path.join(markedPath, scriptPath);

        request(serverUrl + reqPath, function (err, res) {

            res.body.should.not.be.false;

            fs.readFileSync(path.join(testCodeProjectDir, scriptPath), {
                encoding: 'utf8'
            })
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

            fs.readFileSync(path.join(testCodeProjectDir, stylesheetPath), {
                encoding: 'utf8'
            })
            .should.eql(res.body);

            testDone();

        }).on('error', function (err) {
            testDone(err);
        });

    });

});
