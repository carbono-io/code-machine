'use strict';
var domFs = require('../dom-wrapper');
var bower = require('bower');
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

module.exports = function (options) {

    /**
     * Check if there is a .bowerrc file
     * and use it.
     */
    try {
        var brcPath = path.join(options.projectDir, '.bowerrc');
        var brc = fs.readFileSync(brcPath, 'utf8');
        brc = JSON.parse(brc);

        _.assign(bower.config, brc);
    } catch (e) {
        // There is no function to check whether file exists in node,
        // we should use fs.{{someMethod}}Sync within try-catch.
    }

    bower.config.cwd = options.projectDir;

    /**
     * Performs an attribute edition.
     */
    this.editAttribute = function () {

    };

    /**
     *
     */
    this.registerUpdateListener = function (listener) {
        domFs.on('update', listener);
    };

    this.removeUpdateListener = function (listener) {
        domFs.removeListener('update', listener);
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
                try {
                    parentNode.addChildren(element);
                } catch (e) {
                    reject(500, 'REAL INTERNAL SERVER ERROR :) sorry');
                }
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
        var BOWER_INSTALL_OPTIONS = {
            // The following option prevents bower from prompting the
            // user for configs (which is done via a type of Error)
            // and always use the latest version of libraries.
            forceLatest: true,
        };

        return Q.Promise(function (resolve, reject) {
            bower.commands.install(
                    [component.repository],
                    BOWER_INSTALL_OPTIONS,
                    bower.config
                )
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
        var domFile = domFs.getFile('/index.html');

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
                    var compPaths = components[component.name];

                    compPaths = _.isArray(compPaths) ? compPaths : [compPaths];

                    compPaths.forEach(function (mainPath) {
                        mainPath = path.relative(options.sourceDir, mainPath);
                        insertImport(mainPath);
                    });

                    resolve();
                })
                .on('error', function (error) {
                    reject(500, 'Error listing components', error);
                });
        });
    };
};
