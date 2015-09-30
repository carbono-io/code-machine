'use strict';
require('chai').should();
var io = require('socket.io-client');
var fs = require('fs');
var path = require('path');
var config = require('config');
var rimraf = require('rimraf');
var request = require('request');
var DomFs = require('dom-fs');
var Message = require('carbono-json-messages');

var port = config.get('port');
var manipulatorURL = 'http://localhost:' + port;

var projectDir = path.resolve(config.get('projectDir'));
var sourceDir = config.get('sourceDir');
var codeDir = path.join(projectDir, sourceDir);

var indexFile = 'index.html';

var indexPath = path.join(codeDir, indexFile);
var backupPath = path.join(codeDir, indexFile + '.bak');
var bowerDir = path.join(codeDir, 'bower_components');

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

    it('Should be able to insert a new bower component', function (done) {
        var url = 'http://localhost:8000/resources/marked/index.html';
        request(url, function (err, res) {
            var bodyUuid = /body uuid=\"(.+)\"/;
            var match = res.body.match(bodyUuid);
            var uuid = match[1];

            var insert = {
                path: {
                    file: '/index.html',
                    uuid: uuid,
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

            conn.once('command:insertElement/success', function () {
                var domFs = new DomFs(codeDir);
                var domFile = domFs.getFile(insert.path.file);
                var formXpath = '/html/body/iron-form';
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

                var importPath = path.join(codeDir, found.attribs.href);
                fs.statSync(importPath).isFile().should.be.true;
                done();
            });

            conn.once('command:insertElement/error', function (err) {
                done(err);
            });
        });
    });

    it('Should be able to notify file updates', function (done) {
        var url = 'http://localhost:8000/resources/marked/index.html';
        var re = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;

        request(url, function (err, res) {
            var bodyUuid = /body uuid=\"(.+)\"/;
            var match = res.body.match(bodyUuid);
            var uuid = match[1];

            var insertedText = 'Element to insert';

            var insert = {
                path: {
                    file: '/index.html',
                    uuid: uuid,
                },
                html: '<p>' + insertedText + '</p>',
                components: [
                ],
            };

            var message = new Message({apiVersion: '1.0'});
            message.setData({items: [insert]});

            conn.emit('command:insertElement', message.toJSON());

            conn.once('control:contentUpdate', function (message) {
                message = JSON.parse(message);
                var data = message.data.items[0];
                data.file.should.eql(insert.path.file);
                data.elementUuid.should.match(re);
                data.content.should.not.be.null;
                done();
            });

            conn.once('command:insertElement/error', function (err) {
                done(err);
            });
        });
    });
});
