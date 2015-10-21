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
var path = require('path');
var fs = require('fs');

module.exports = function (options) {

    var entitiesFilePath = path.join(options.codeDir, 'entities.json');

    var entities = JSON.parse(fs.readFileSync(entitiesFilePath));

    /**
     *  Creates a new entity in the project. The entity is saved to the
     *  project's entities.json.
     *
     *  @param {string} entityName - name of entity to create.
     *  @param {string} route - route to the CRUDr responsible for this entity.
     *  @param {?Object} schema - entity's schema.
     */
    var createEntity = function (entityName, route, schema) {
        if (entityName in entities) {
            throw new Error('Unavailable entity name: ' + entityName);
        }
        if (!route) {
            throw new Error('CRUDr route not provided for entity creation');
        }

        schema = schema || {};

        // Maybe we should validate the schema's sanity here?

        entities[entityName] = {
            route: route,
            schema: schema,
        };
        saveEntities();
    };

    var saveEntities = function () {
        fs.writeFileSync(entitiesFilePath, JSON.stringify(entities, null, 4));
    };

    return {
        createEntity: createEntity,
    };
};

