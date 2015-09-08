'use strict';
var domFs = require('../dom-wrapper');
var bower = require('bower');
var Q = require('q');
var _ = require('lodash');

module.exports = function (codeDir) {

    bower.config.cwd = codeDir;

    /**
     * Performs an attribute edition.
     */
    this.editAttribute = function () {

    };

    /**
     * Inserts html code at a location specified by path. Success or
     * failure are reported through reply.success() and reply.failure().
     *
     * @param {string} file - file path within the project.
     * @param {string} xpath - xpath of parent element.
     * @param {string} html - HTML code to insert.
     * @param {Object} reply - SocketReply object for success/error messages.
     */
    this.insertElementAtXPath = function (file, xpath, html, reply) {
        insertHtmlAtXpath(file, xpath, html)
            .then(reply.success.bind(reply), reply.error.bind(reply));
    };

    /**
     * Inserts html code at a location specified by path, and installs
     * possible bower components required by the inserted code. Success or
     * failure are reported through reply.success() and reply.failure().
     *
     * @param {Object} path - path at which the code should be inserted.
     * @param {string} path.file - file path within the project.
     * @param {string} path.xpath - xpath of parent element.
     * @param {string} html - HTML code to insert.
     * @param {{name: string, repository: string}[]} components - Bower
     *      components required by the html code. Each component has
     *      properties specifying its name and a repository path that
     *      bower can resolve.
     * @param {Object} reply - SocketReply object for success/error messages.
     */
    this.insertElement = function (path, html, components, reply) {
        var installPromises = components.map(installAndImport, this);

        Q.all(installPromises)
            .then(_.partial(insertHtmlAtXpath, path.file, path.xpath, html))
            .then(reply.success.bind(reply), reply.error.bind(reply));
    };

    /**
     * Creates a promise to insert a new html element (passed as a string) at
     * a specific location within a file's DOM.
     * @todo Alter DomFs behavior to keep changes in memory.
     *
     * @param {string} file - file path within the code directory.
     * @param {string} xpath - xpath where new element will be inserted.
     * @param {string} element - HTML code to be inserted.
     * @returns {Promise}
     */
    var insertHtmlAtXpath = function (file, xpath, element) {
        var domFile = domFs.getFile(file);

        return Q.Promise(function (resolve, reject) {
            if (!file) {
                reject(400, 'No file provided for insertion');
            }
            if (!xpath) {
                reject(400, 'No xPath provided for insertion');
            }

            var parentNode = domFile.getElementByXPath(xpath);

            if (element) {
                parentNode.addChildren(element);
            }

            // The new state of the file must be written to disk, so that
            // the ResourceServer serves the modified file.
            domFile.write();
            resolve();
        });
    };

    var installAndImport = function (component) {
        return installComponent(component)
            .then(addComponentImport);
    };

    /**
     * Creates a promise to install a bower component.
     * @param {{name:string, repository: string}} component
     * @returns {Promise}
     */
    var installComponent = function (component) {
        return Q.Promise(function (resolve, reject) {
            bower.commands.install([component.repository], {}, bower.config)
                .on('end', function () {
                    resolve(component);
                })
                .on('error', function (error) {
                    reject(500, 'Error installing component', error);
                });
        });
    };

    /**
     * Creates a promise to add a link to a component in the head of project's
     * index.html. Checks if a link to the same component is already present
     * before insertion.
     * @param {{name: string, repository: string}} component
     * @returns {Promise}
     */
    var addComponentImport = function (component) {
        var domFile = domFs.getFile('index.html');

        var insertImport = function (importPath) {
            var head = domFile.getElementByXPath('/html/head');

            var found = head.children.reduce(function (state, item) {
                if (item.type === 'tag' && item.name === 'link') {
                    return state || item.attribs.href === importPath;
                }
                return state;
            }, false);

            if (!found) {
                var html = '<link rel="import" href="' + importPath + '">';
                head.addChildren(html);
                domFile.write();
            }
        };

        return Q.Promise(function (resolve, reject) {
            bower.commands.list({paths: true}, bower.config)
                .on('end', function (components) {
                    var compPath = components[component.name];
                    insertImport(compPath);
                    resolve();
                })
                .on('error', function (error) {
                    reject(500, 'Error listing components', error);
                });
        });
    };
};
