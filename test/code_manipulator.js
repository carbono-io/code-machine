'use strict';
require('chai').should();
var io = require('socket.io-client');
var fs = require('fs');
var path = require('path');
var config = require('config');
var rimraf = require('rimraf');
var DomFs = require('dom-fs');
var Message = require('carbono-json-messages');

var port = config.get('port');
var manipulatorURL = 'http://localhost:' + port;

var projectDir = path.resolve(config.get('codeDir'));
var indexFile = 'index.html';
var indexPath = path.join(projectDir, indexFile);
var backupPath = path.join(__dirname, indexFile + '.bak');
var bowerDir = path.join(projectDir, 'bower_components');

var conn;

describe('Code Manipulator', function () {
    this.timeout(30000);

    before(function (done) {
        conn = io.connect(manipulatorURL);
        conn.on('connect', done);
    });

    after(function (done) {
        if (conn.connected) {
            conn.disconnect();
        }

        rimraf(bowerDir, done);
    });

    beforeEach(function (done) {
        var index = fs.createReadStream(indexPath);
        index.pipe(fs.createWriteStream(backupPath));
        index.on('end', done);
    });

    afterEach(function (done) {
        var backup = fs.createReadStream(backupPath);
        backup.pipe(fs.createWriteStream(indexPath));
        backup.on('end', function () {
            fs.unlink(backupPath);
            done();
        });
    });

    it('Should be able to insert new HTML elements', function (done) {
        var insertedText = 'Element to insert';

        var insert = {
            file: 'index.html',
            xpath: '/html/body',
            element: '<p>' + insertedText + '</p>',
        };

        var message = new Message({apiVersion: '1.0'});
        message.setData({items: [insert]});

        conn.emit('command:insertElementAtXPath', message.toJSON());

        conn.on('command:insertElementAtXPath/success', function () {
            var domfs = new DomFs(projectDir);
            var domFile = domfs.getFile(insert.file);
            var foundElement = domFile.getElementByXPath(insert.xpath + '/p');
            var foundText = foundElement.children[0].data;

            foundText.should.be.equal(insertedText);

            done();
        });

        conn.on('command:insertElementAtXPath/error', function (message) {
            done(message);
        });
    });

    it('Should be able to insert a new bower component', function (done) {
        var insert = {
            path: {
                file: 'index.html',
                xpath: '/html/body',
            },
            html: '<iron-form></iron-form>',
            components: [
                {
                    name: 'iron-form',
                    repository: 'PolymerElements/iron-form',
                },
            ],
        };

        var message = new Message({apiVersion: '1.0'});
        message.setData({items: [insert]});

        conn.emit('command:insertElement', message.toJSON());

        conn.on('command:insertElement/success', function () {
            var domFs = new DomFs(projectDir);
            var domFile = domFs.getFile(insert.path.file);
            var formXpath = insert.path.xpath + '/iron-form';
            var ironForm = domFile.getElementByXPath(formXpath);
            ironForm.should.not.be.null;

            var head = domFile.getElementByXPath('/html/head');
            var found = head.children.reduce(function (found, item) {
                if (item.type === 'tag' && item.name === 'link' &&
                    item.attribs.href.indexOf('iron-form') !== -1) {
                    found = item;
                }
                return found;
            }, null);
            found.should.not.be.null;

            var importPath = path.join(projectDir, found.attribs.href);
            fs.statSync(importPath).isFile().should.be.true;
            done();
        });

        conn.on('command:insertElement/error', function (err) {
            done(err);
        });

    });

});
