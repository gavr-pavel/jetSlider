var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');



gulp.task('uglify', function () {
    gulp.src('./jquery.jetslider.js')
        .pipe(uglify())
        .pipe(concat('jquery.jetslider.min.js'))
        .pipe(gulp.dest('./'));
});


gulp.task('default', ['uglify']);
