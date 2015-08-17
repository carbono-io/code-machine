'use strict';
var nodemon = require('gulp-nodemon');

module.exports = function (gulp) {

    gulp.task('nodemon', function () {
        nodemon({
            script: 'index.js',
            ext: 'js',
        });
    });

};
