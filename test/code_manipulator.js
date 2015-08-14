require('chai').should();
var io = require('socket.io-client');
var fs = require('fs');
var path = require('path');
var config = require('config');

var DomFs   = require('dom-fs');

var port = config.get('port');

var manipulatorURL = 'http://localhost:' + port;

var testCodeProjectDir = path.join(__dirname, 'testServer')
var indexFile = 'index.html'

var indexPath = path.join(testCodeProjectDir, indexFile);
var backupPath = path.join(__dirname, indexFile + '.bak');

var conn;

describe('Code Manipulator', function () {

    beforeEach( function(done) {
        fs.createReadStream(indexPath).pipe(fs.createWriteStream(backupPath));

        conn = io.connect(manipulatorURL);

        conn.on('connect', done)
    });

    afterEach( function(done) {
        fs.createReadStream(backupPath).pipe(fs.createWriteStream(indexPath));
        fs.unlink(backupPath);

        if (conn.connected) {
            conn.disconnect();
        }
        done();
    });

    it('Should be able to insert new HTML elements', function (testDone) {
        var insertedText = 'Element to insert';

        var insert = {
            file: 'index.html',
            xpath: '/html/body',
            element: '<p>' + insertedText + '</p>'
        };

        conn.emit('command:insertElementAtXPath', insert);

        conn.on('edited', function () {
            var domfs = new DomFs(testCodeProjectDir);
            var domFile = domfs.getFile(insert.file);
            var foundElement = domFile.getElementByXPath(insert.xpath + '/p');
            var foundText = foundElement.children[0].data;

            foundText.should.be.equal(insertedText);

            testDone();
        });

        conn.on('error', function (err) {
            testDone(err);
        });

    });

});
