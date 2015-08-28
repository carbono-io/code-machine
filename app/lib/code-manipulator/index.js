'use strict';
var DomFs = require('dom-fs');
var bower = require('bower');
var Q = require('q');
var async = require('async');

module.exports = function (codeDir) {

    this.codeDir = codeDir;
    this._domFs = new DomFs(codeDir);

    /**
     * Performs an attribute edition.
     */
    this.editAttribute = function () {

    };

    /**
     * Inserts a new html element (passed as a string) at a specific location
     * within a file's DOM.
     * @todo Alter DomFs behavior to keep changes in memory.
     *
     * @param {string} file - file path within the code directory.
     * @param {string} xpath - xpath where new element will be inserted.
     * @param {string} element - HTML code to be inserted.
     */
    this.insertElementAtXPath = function (file, xpath, element) {
        if (!file) {
            throw new Error('No file provided');
        }
        if (!xpath) {
            throw new Error('No x-path of parent element provided');
        }

        var domFile = this._domFs.getFile(file);
        var parentNode = domFile.getElementByXPath(xpath);

        if (element) {
            parentNode.addChildren(element);
        }

        // The new state of the file must be written to disk, so that the
        // ResourceServer serves the modified file.
        domFile.write();
    };

    /**
     * Inserts html code at a location specified by path, and installs
     * possible bower components required by the inserted code.
     *
     * @param {Object} path - path at which the code should be inserted.
     * @param {string} path.file - file path within the project.
     * @param {string} path.xpath - xpath of parent element.
     * @param {string} html - HTML code to insert.
     * @param {{name: string, repository: string}[]} components - Bower
     *      components required by the html code. Each component has
     *      properties specifying its name and a repository path that
     *      bower can resolve.
     */
    this.insertElement = function (path, html, components, respond) {
        /*  @todo this should ideally happen only after all components are
         * installed and imported.
         */
        try {
            this.insertElementAtXPath(path.file, path.xpath, html);
        } catch (error) {
            respond(error);
            return;
        }

        components.forEach(function (component) {
            this.installComponent(component)
                .then(this.addComponentImport(component))
                .then(respond, respond);
        }.bind(this));
    };

    this.installComponent = function (component) {
        return Q.Promise(function (resolve, reject) {
            bower.commands.install([component.repository])
                .on('end', function () {
                    resolve();
                })
                .on('error', function (error) {
                    reject(error);
                });
        });
    };

    this.addComponentImport = function (component) {
        var insertImport = function (importPath) {
            var strippedPath = importPath.substr(this.codeDir.length);
            this.insertHTMLImport(strippedPath);
        }.bind(this);

        return function () {
            return Q.Promise(function (resolve, reject) {
                bower.commands.list({paths: true})
                    .on('end', function (components) {
                        var compPath = components[component.name];
                        insertImport(compPath);
                        resolve();
                    })
                    .on('error', function (error) {
                        reject(error);
                    });
            });
        };
    };

    this.insertHTMLImport = function (path) {
        var domFile = this._domFs.getFile('index.html');
        var head = domFile.getElementByXPath('/html/head');

        var found = head.children.reduce(function (state, item) {
            if (item.type === 'tag' && item.name === 'link') {
                return state || item.attribs.href === path;
            }
            return state;
        }, false);

        if (!found) {
            var html = '<link rel="import" href="' + path + '">';
            head.addChildren(html);
            domFile.write();
        }
    };

};
