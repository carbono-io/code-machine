'use strict';

function resourceServer(server, app) {
  app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
  });
}

module.exports = resourceServer;