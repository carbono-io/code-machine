'use strict';
module.exports = function (app) {

    var resources = app.controllers.resources;

    app.use('/resources', resources.getServer);

    return this;
};
