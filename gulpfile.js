var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');


gulp.task('lint', function() {
  gulp.src('./jquery.jetslider.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('uglify', function () {
    gulp.src('./jquery.jetslider.js')
        .pipe(uglify())
        .pipe(concat('jquery.jetslider.min.js'))
        .pipe(gulp.dest('./'));
});


gulp.task('default', ['lint', 'uglify']);
