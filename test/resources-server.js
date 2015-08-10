var fs   = require('fs');
var path = require('path');

require('chai').should();
var request = require('request');
var DomFs   = require('dom-fs');

// retrieve environment variables
var port = process.env.PORT || 9000;

var serverUrl = 'http://localhost:' + port;
var testCodeProjectDir = path.join(__dirname, 'resources/polymer-starter-kit')

describe('Clean resources server', function () {
  
  it('Serves the clean files', function (testDone) {

    request(serverUrl + '/resources/clean/app/index.html', function (err, res) {

      // original content
      var fileContents = fs.readFileSync(path.join(testCodeProjectDir, 'app/index.html'), {
        encoding: 'utf8'
      });

      res.body.should.eql(fileContents);

      testDone();
    })
    .on('error', function (e) {
      testDone(e);
    });

  });
});

describe('Marked resources server', function () {

  it('Serves .html files with x-path marcations', function (testDone) {

    var domFs = new DomFs(testCodeProjectDir);

    request(serverUrl + '/resources/marked/app/index.html', function (err, res) {

      // read the file with the domFs.
      domFs.getFile('app/index.html')
        .stringify(function (element) {
          // Only mark tag elements
          if (element.type === 'tag') {
            element.attribs['x-path'] = element.getXPath();
          }
        })
        .should.eql(res.body);

      testDone();
    }).on('error', function (e) {
      testDone(e)
    });

  });

  it('Serves .js files without modification', function (testDone) {

    var scriptPath = 'app/scripts/app.js';
    var scriptUrl  = serverUrl + '/resources/marked/' + scriptPath;

    request(scriptUrl, function (err, res) {

      res.body.should.not.be.false;

      fs.readFileSync(path.join(testCodeProjectDir, scriptPath), {
        encoding: 'utf8'
      })
      .should.eql(res.body);

      testDone();

    }).on('error', function (err) {
      testDone(err);
    });

  });

  it('Serves .js files from bower_components without modification', function (testDone) {

    var scriptPath = 'app/bower_components/page/page.js';
    var scriptUrl  = serverUrl + '/resources/marked/' + scriptPath;

    request(scriptUrl, function (err, res) {

      res.statusCode.should.eql(200);
      res.body.should.not.be.false;

      fs.readFileSync(path.join(testCodeProjectDir, scriptPath), {
        encoding: 'utf8'
      })
      .should.eql(res.body);

      testDone();

    }).on('error', function (err) {
      testDone(err);
    });

  });


  it('Serves .css files without modification', function (testDone) {

    var stylesheetPath = 'app/styles/main.css';
    var stylesheetUrl  = serverUrl + '/resources/marked/' + stylesheetPath;

    request(stylesheetUrl, function (err, res) {

      res.body.should.not.be.false;

      fs.readFileSync(path.join(testCodeProjectDir, stylesheetPath), {
        encoding: 'utf8'
      })
      .should.eql(res.body);

      testDone();

    }).on('error', function (err) {
      testDone(err);
    });

  });

  it('Serves .css files from bower_components without modification', function (testDone) {

    var stylesheetPath = 'app/bower_components/paper-drawer-panel/paper-drawer-panel.css';
    var stylesheetUrl  = serverUrl + '/resources/marked/' + stylesheetPath;

    request(stylesheetUrl, function (err, res) {

      res.headers['content-type'].should.eql('text/css; charset=UTF-8');
      res.body.should.not.be.false;

      fs.readFileSync(path.join(testCodeProjectDir, stylesheetPath), {
        encoding: 'utf8'
      })
      .should.eql(res.body);

      testDone();

    }).on('error', function (err) {
      testDone(err);
    });

  });

  it('Serves .png files without modification', function (testDone) {

    var stylesheetPath = 'app/images/touch/chrome-touch-icon-192x192.png';
    var stylesheetUrl  = serverUrl + '/resources/marked/' + stylesheetPath;

    request(stylesheetUrl, function (err, res) {

      res.body.should.not.be.false;

      fs.readFileSync(path.join(testCodeProjectDir, stylesheetPath), {
        encoding: 'utf8'
      })
      .should.eql(res.body);

      testDone();

    }).on('error', function (err) {
      testDone(err);
    });

  });


});