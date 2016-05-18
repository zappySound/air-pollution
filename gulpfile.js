var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var stripDebug = require('gulp-strip-debug');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var express = require('express');

var server;

gulp.task('server', function () {
    server = express();
    server.use(express.static('build'));
    server.listen(3000);
    browserSync({
        proxy: 'localhost:3000'
    });
});

function reload() {
    if (server) {
        return browserSync.reload({
            stream: true
        });
    }
    return gutil.noop();
}

gulp.task('combine-js', function () {

    gulp.src([
                'bower_components/jquery/dist/jquery.js',
                'bower_components/jquery-ui/jquery-ui.js',
                'bower_components/angular/angular.js',
                'bower_components/angular-ui-router/release/angular-ui-router.js',
                'bower_components/leaflet/dist/leaflet.js',
                'bower_components/mathjs/dist/math.js',
                'vender/slider.js',
                'vender/jquery.xdomainajax.js'
            ])
            //.pipe(uglify())
            .pipe(concat('vender.js'))
            .pipe(gulp.dest('build/js'));

    gulp.src([
                'js/route.js',
                'js/config.js',
                'js/root/**/*.js',
                'js/controllers/**/*.js',
                'js/directives/**/*.js',
                'js/services/**/*.js',
                'js/current/**/*.js',
                'js/old/**/*.js'

            ])
            .pipe(stripDebug())
            .pipe(uglify())
            .pipe(concat('script.js'))
            .pipe(gulp.dest('build/js'))
            .pipe(reload());

});

gulp.task('compile-sass', function () {

    gulp.src('styles/**/*.scss')
            .pipe(sass())
            .pipe(gulp.dest('build/css'))
            .pipe(reload());

    gulp.src([
                'bower_components/leaflet/**/*.css',
                'vender/**/*.css'
            ])
            .pipe(concat('vender.css'))
            .pipe(gulp.dest('build/css/vender/'));

});

gulp.task('move-files', function () {

    gulp.src('index.html')
        .pipe(gulp.dest('build/'))
        .pipe(reload());

    gulp.src('js/**/*.html')
        .pipe(gulp.dest('build/js/'))
        .pipe(reload());

    gulp.src('img/**/*')
        .pipe(gulp.dest('build/img'));

    gulp.src('vender/dark-hive/images/**/*')
        .pipe(gulp.dest('build/css/vender/images/'));

    gulp.src('fonts/**/*')
        .pipe(gulp.dest('build/fonts/'));

    gulp.src('demo-data/**/*')
        .pipe(gulp.dest('build/demo-data/'));
});


gulp.task('watch', function () {
    gulp.watch('js/**/*.js', ['combine-js']);
    gulp.watch('styles/**/*.scss', ['compile-sass']);
    gulp.watch('js/**/*.html', ['move-files']);
    gulp.watch('build/**');
});

gulp.task('dev', [
    'server',
    'move-files',
    'combine-js',
    'compile-sass',
    'watch'
]);