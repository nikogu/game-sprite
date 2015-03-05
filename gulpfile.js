var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

var browserify = require('browserify');
var fs = require('fs');

var b = browserify();
b.add('./src/index.js');

gulp.task('default', function() {
    gulp.watch('src/**/*.js', function(event) {
        b.bundle(function(err, buf) {
            fs.writeFile('./build/game-sprite.js', buf.toString(), function (err) {
                if (err) throw err;
                console.log('Bundle!');
                gulp.src('build/game-sprite.js').
                    pipe(uglify({
                        preserveComments: 'some'
                    })).
                    pipe(rename('game-sprite.min.js')).
                    pipe(gulp.dest('build'));
            });
        });
    });
});
