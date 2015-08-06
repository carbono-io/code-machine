'use strict';
// Native dependencies
var path = require('path');

// External dependencies
var gulp    = require('gulp');
var notify  = require('gulp-notify');
var jscs    = require('gulp-jscs');
var jshint  = require('gulp-jshint');
var exec    = require('child_process').exec;
var changed = require('gulp-changed');
var nodemon = require('gulp-nodemon');

// Constants
var JS_PATH = ['lib/**/*.js'];

gulp.task('jscs', function() {

  gulp.src(JS_PATH)
    .pipe(jscs('.jscsrc'))
    .on('error', notify.onError({
      title: "JSCS Error :/",
      message: "Error: <%= error.message %>",
    }));
});

gulp.task('jshint', function() {

  gulp.src(JS_PATH)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .on('error', notify.onError({
      title: "JSHint Error :/",
      message: "Error: <%= error.message %>",
    }));
});

gulp.task('default', function() {
  console.log('Hello world.');
});

gulp.task('server', function(cb) {
  exec('node app.js', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('nodemon', function () {

  var testProjectPath = path.join(__dirname, 'tests/test-code-project');

  nodemon({
    script: 'cli/start.js',
    ext: 'js',
    env: {
      PORT: 9000,
      CODE_DIR: testProjectPath
    }
  });
});

/**
 * Defines the gulp task.
 * Watches changes on any .js file and runs jshint and jscs
 */
gulp.task('develop', function () {
  gulp.watch(JS_PATH, ['jscs', 'jshint']);
});
