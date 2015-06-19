var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var stripDebug = require('gulp-strip-debug');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var express = require('express');

var server;

// 서버를 띄운다.
gulp.task('server', function () {
    server = express();
    server.use(express.static('build'));
    server.listen(3000);
    browserSync({
        proxy: 'localhost:3000'
    });
});

// 브라우져 새로고침 한다.
function reload() {
    if (server) {
        return browserSync.reload({
            stream: true
        });
    }
    return gutil.noop(); // 아무 것도 하지 않는 스트림을 리턴한다.
}

// 자바스크립트 파일을 하나로 합치고 압축한다.
gulp.task('combine-js', function () {

    gulp.src([
                'bower_components/jquery/dist/jquery.js',
                'bower_components/jquery-ui/jquery-ui.js',
                'bower_components/angular/angular.js',
                'bower_components/angular-ui-router/release/angular-ui-router.js',
                'bower_components/leaflet/dist/leaflet.js',
                'bower_components/mathjs/dist/math.js',
                'vendor/slider.js',
                'vendor/jquery.xdomainajax.js'
            ])
            //.pipe(uglify())
            .pipe(concat('vendor.js'))
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
            //.pipe(stripDebug())
            //.pipe(uglify())
            .pipe(concat('script.js'))
            .pipe(gulp.dest('build/js'))
            .pipe(reload());

});

// sass 파일을 css 로 컴파일한다.
gulp.task('compile-sass', function () {

    gulp.src('styles/**/*.scss')
            .pipe(sass())
            .pipe(gulp.dest('build/css'))
            .pipe(reload());

    gulp.src([
                'bower_components/leaflet/**/*.css',
                'vendor/**/*.css'
            ])
            .pipe(concat('vendor.css'))
            .pipe(gulp.dest('build/css/vendor/'));

});


// 수정없이 파일만 이동한다.
gulp.task('move-files', function () {

    gulp.src('index.html')
        .pipe(gulp.dest('build/'))
        .pipe(reload());

    gulp.src('js/**/*.html')
        .pipe(gulp.dest('build/js/'))
        .pipe(reload());

    gulp.src('img/**/*')
        .pipe(gulp.dest('build/img'));

    gulp.src('vendor/dark-hive/images/**/*')
        .pipe(gulp.dest('build/css/vendor/images/'));

    gulp.src('fonts/**/*')
        .pipe(gulp.dest('build/fonts/'));

    gulp.src('demo-data/**/*')
        .pipe(gulp.dest('build/demo-data/'));
});

// 파일 변경 감지
gulp.task('watch', function () {
    gulp.watch('js/**/*.js', ['combine-js']);
    gulp.watch('styles/**/*.scss', ['compile-sass']);
    gulp.watch('js/**/*.html', ['move-files']);
    gulp.watch('build/**');
});

//기본 task 설정
gulp.task('dev', [
    'server',
    'move-files',
    'combine-js',
    'compile-sass',
    'watch'
]);