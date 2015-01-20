var gulp = require('gulp');
var uglify = require('gulp-uglifyjs');
var jshint = require('gulp-jshint');


gulp.task('lint', function() {
  gulp.src('./jquery.jetslider.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('uglify', function () {
    gulp.src('./jquery.jetslider.js')
        .pipe(uglify('jquery.jetslider.min.js', {
            outSourceMap: true
        }))
        .pipe(gulp.dest('./'));
});


gulp.task('default', ['lint', 'uglify']);
