require('chai').should();
var io     = require('socket.io-client');

// retrieve environment variables
var port = process.env.PORT || 8000;

var socketURL = 'http://localhost:' + port;

describe('Code Manipulator', function () {
  
  it('Should be capable of connecting', function (testDone) {
    var client = io.connect(socketURL);

    client
      .on('connect', function () {
        testDone();
      })
      .on('connect_error', function (err) {
        testDone(err);
      });
  });
});
