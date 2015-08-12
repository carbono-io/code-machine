'use strict';
module.exports = function (app) {

    var api = app.controllers.api;

    app.get('/', api.describe);

    return this;
};