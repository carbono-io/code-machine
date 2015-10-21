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

    it('Should be able to create entity with given schema', function (done) {
        var entityName = 'newEntity';
        var entityRoute = '/my/route';
        var entitySchema = {name: 'base:String'};

        em.createEntity(entityName, entityRoute, entitySchema);

        var entities = JSON.parse(fs.readFileSync(testDir + 'entities.json'));

        entities.should.have.ownProperty(entityName);
        entities[entityName].route.should.eql(entityRoute);
        entities[entityName].schema.should.eql(entitySchema);

        done();
    });

    it('Should be able to create entity with no schema given', function (done) {
        var entityName = 'entityWithoutSchema';
        var entityRoute = '/my/route';

        em.createEntity(entityName, entityRoute);

        var entities = JSON.parse(fs.readFileSync(testDir + 'entities.json'));

        entities.should.have.ownProperty(entityName);
        entities[entityName].route.should.eql(entityRoute);
        entities[entityName].schema.should.eql({});

        done();
    });

    it('Should throw error when creating existing entity', function (done) {
        var existingName = 'newEntity';
        var route = '/my/route';

        em.createEntity.bind(null, existingName, route).should.throw(Error);

        done();
    });

    it('Should throw error if no route is given', function (done) {
        var entityName = 'entityWithoutRoute';

        em.createEntity.bind(null, entityName).should.throw(Error);

        done();
    });
});
