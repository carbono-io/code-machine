'use strict';
require('chai').should();
var rimraf = require('rimraf');
var fs = require('fs');

var testDir = 'entityTest/';

describe('Entity Manager Lib', function () {
    var em;

    before(function (done) {
        fs.mkdirSync(testDir);
        fs.writeFileSync(testDir + 'entities.json', '{}');

        em = require('../app/lib/entity-manager')({codeDir: testDir});

        done();
    });

    after(function (done) {
        rimraf(testDir, done);
    });

    it('Should be able to create a new entity', function (done) {
        var entityName = 'newEntity';
        var entitySchema = {name: 'base:String'};

        em.createEntityFromSchema(entityName, entitySchema);

        var entities = JSON.parse(fs.readFileSync(testDir + 'entities.json'));

        entities.should.have.ownProperty(entityName);
        entities[entityName].should.eql(entitySchema);

        done();
    });
});
