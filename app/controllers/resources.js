'use strict';
var createResourcesServer = require('../lib/code-interpreter');

module.exports = function(app) {

    this.getServer = createResourcesServer(app.options);

    return this;
};