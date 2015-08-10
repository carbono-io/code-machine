'use strict';
// Native dependencies
var path = require('path');

// External dependencies
var nodemon = require('gulp-nodemon');


module.exports = function (gulp, jsPath) {

  gulp.task('nodemon', function () {

    var testProjectPath = path.join(__dirname, '../test/resources/polymer-starter-kit');

    nodemon({
      script: 'cli/start.js',
      ext: 'js',
      env: {
        PORT: 9000,
        CODE_DIR: testProjectPath
      }
    });
  });


};