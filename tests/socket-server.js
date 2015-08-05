var should = require('should');
var io     = require('socket.io-client');

var socketURL = 'http://localhost:8000';

describe('Socket server', function () {
  
  it('Should be capable of connecting', function (done) {
    var client = io.connect(socketURL);

    client.on('connect', function () {

      console.log('connected')
      done();
    });
  });
})