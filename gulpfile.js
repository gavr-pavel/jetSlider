var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');



gulp.task('uglify', function () {
    gulp.src('./jquery.jetscroll.js')
        .pipe(uglify())
        .pipe(concat('jquery.jetscroll.min.js'))
        .pipe(gulp.dest('./'));
});


gulp.task('default', ['uglify']);
