'use strict';
var _ =  require('lodash');

module.exports = function (app) {

    this.describe  = function (req, res) {
        var serviceDescription = _.pick(
            app.options,
            ['port', 'codeDir']
        );
        res.json(serviceDescription);
    };

    return this;
};