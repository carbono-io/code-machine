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
