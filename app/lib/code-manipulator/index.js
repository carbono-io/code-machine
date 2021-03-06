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
var domFs = require('../dom-wrapper');
var bower = require('bower');
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var projResManager = require('../project-resource-manager');

module.exports = function (options) {

    var entityManager = require('../entity-manager')(options);

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
     * Inserts html code at a location specified by path, and installs
     * possible bower components required by the inserted code. Success or
     * failure are reported through reply.success() and reply.failure().
     *
     * @param {Object} path - path at which the code should be inserted.
     * @param {string} path.file - file path within the project.
     * @param {string} path.uuid - uuid of parent element.
     * @param {string} html - HTML code to insert.
     * @param {{name: string, repository: string}[]} components - Bower
     *      components required by the html code. Each component has
     *      properties specifying its name and a repository path that
     *      bower can resolve.
     * @param {Object} reply - SocketReply object for success/error messages.
     */
    this.insertElement = function (path, html, components, reply) {
        // Install components in sequence, so that the installation
        // does not run into filesystem conflicts.
        //
        // TODO: improve this, bower supports multiple component
        // paralell installation, we must take advantage of that.
        //
        // Some documentation on how to run sequence of promise returning
        // functions.
        // https://github.com/kriskowal/q#sequences
        // http://stackoverflow.com/questions/17757654/how-to-chain-a-variable\
        // -number-of-promises-in-q-in-order
        var installationChain;

        if (components.length > 0) {
            // Only build up an installation chain if there
            // are dependencies to be installed
            installationChain = components.reduce(
                    function (previousPromise, component) {
                return previousPromise.then(function () {
                    return installAndImport(component);
                });
            }, installAndImport(components.shift()));
        } else {
            // Otherwise, simply make up a promise
            installationChain = new Q();
        }

        installationChain
            .then(_.partial(insertChildrenHtml, path.file, path.uuid, html))
            .then(reply.success.bind(reply), reply.error.bind(reply));
    };

    /**
     * Creates a new entity, with the schema provided.
     *
     * @param {string} entityName - the entity's name.
     * @param {Object} schema - the entity's schema.
     * @param {Object} reply - SocketReply object for success/error messages.
     */
    this.createEntityFromSchema = function (entityName, schema, reply) {
        if (schema) {
            try {
                var route = projResManager.getCrudRoute();
                entityManager.createEntity(entityName, route, schema);
                reply.success();
            } catch (e) {
                reply.error({
                    code: 500,
                    message: 'CreateEntity error',
                    exception: e,
                });
            }
        } else {
            reply.error({
                code: 400,
                message: 'No schema provided for creation',
            });
        }
    };

    /**
     * Binds a component to an entity. Currently this only means creating an
     * attribute in the component's HTML with the entity name.
     *
     * @param {Object} path - path to the component's HTML element.
     * @param {string} path.file - name of the file where the component is.
     * @param {string} path.uuid - uuid of the HTML element.
     * @param {string} entityName - name of the entity to bind the component to.
     * @param {Object} reply - SocketReply object for success/error messages.
     */
    this.bindComponentToEntity = function (path, entityName, reply) {
        try {
            // @todo Validate if entity exists before binding!
            var domFile = domFs.getFile(path.file);
            var component = domFile.getElementByUuid(path.uuid);
            component.editAttribute('entity', entityName);
            reply.success();
        } catch (err) {
            reply.error({
                code: 500,
                message: 'Bind error',
                exception: err,
            });
        }
    };

    /**
     * Creates a promise to insert a new html element (passed as a string) at
     * a specific location within a file's DOM.
     *
     * @param {string} file - file path within the code directory.
     * @param {string} uuid - uuid of parent element.
     * @param {string} element - HTML code to be inserted.
     * @returns {Promise}
     */
    var insertChildrenHtml = function (file, uuid, element) {
        var domFile = domFs.getFile(file);

        return Q.Promise(function (resolve, reject) {
            if (!file) {
                reject({
                    code: 400,
                    message: 'No file provided for insertion',
                });
            }
            if (!uuid) {
                reject({
                    code: 400,
                    message: 'No parent uuid provided for insertion',
                });
            }

            var parentNode = domFile.getElementByUuid(uuid);

            if (element) {
                try {
                    var inserted = parentNode.addChild(element);
                } catch (e) {
                    reject({
                        code: 500,
                        message: 'REAL INTERNAL SERVER ERROR :) sorry',
                        exception: e,
                    });
                }
            }

            // The new state of the file must be written to disk, so that
            // the ResourceServer serves the modified file.
            domFile.write();

            resolve({
                items: [
                    {uuid: inserted.uuid},
                ],
            });
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
                    reject({
                        code: 500,
                        message: 'Error installing component',
                        exception: error,
                    });
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
                head.addChild(html);
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
                    reject({
                        code: 500,
                        message: 'Error listing components',
                        exception: error,
                    });
                });
        });
    };
};
