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
     *  @param [String] entityName - name of entity to create.
     *  @param [Object] schema - entity's schema.
     */
    var createEntityFromSchema = function (entityName, schema) {
        if (entityName in entities) {
            console.log('That\'s bad... inserting entity that already exists');
            return;
        }

        // Maybe we should validate the schema's sanity here?

        entities[entityName] = schema;
        saveEntities();
    };

    var saveEntities = function () {
        fs.writeFileSync(entitiesFilePath, JSON.stringify(entities));
    };

    return {
        createEntityFromSchema: createEntityFromSchema,
    };
};

