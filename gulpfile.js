'use strict';

var path = {
    build: {
        html: 'app/build/',
        js: 'app/build/js/',
        css: 'app/build/css/',
        img: 'app/build/img/',
        fonts: 'app/build/fonts/'
    },
    src: {
        html: 'app/src/pug/*.pug',
        js: 'app/src/js/main.js',
        sass: 'app/src/sass/**/*.sass',
        img: 'app/src/img/**/*.*',
        fonts: 'app/src/fonts/**/*.*'
        // libs: 'app/src/libs/**/*.js'
    },
    watch: {
        html: 'app/src/pug/*.pug',
        js: 'app/src/js/**/*.js',
        css: 'app/src/sass/**/*.sass',
        img: 'app/src/img/**/*.*',
        fonts: 'app/srs/fonts/**/*.*',
        libs: 'app/src/libs/**/*.js'
    },
    clean: './app/build'
};


var autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];


var gulp = require('gulp'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    del = require('del'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    jpegrecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    bSync = require('browser-sync').create();



// Static server
gulp.task('bSync', function () {
    bSync.init({
        server: {
            baseDir: './app/build'
        }
    });
});





gulp.task('pug:build', async function () {
    return gulp.src(path.src.html)
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.html))
        .on('end', bSync.reload);
});



gulp.task('sass:build', async function () {
    return gulp.src(path.src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: autoprefixerList,
            cascade: false
        }))
        .on("error", notify.onError({
            title: "Styles error"
        }))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(bSync.stream({once: true}));
        // .on('end', bSync.reload);
    
});


gulp.task('script:lib', async function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js',
        'node_modules/slick-carousel/slick/slick.min.js'])
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest(path.build.js))
});



gulp.task('script:main', async function () { 
    return gulp.src(path.src.js)
        .pipe(gulp.dest(path.build.js))
});



gulp.task('clean:build', async function () {
    return del([ path.clean ]);
});



gulp.task('image:build', async function () {
    gulp.src(path.src.img) // путь с исходниками картинок
        .pipe(cache(imagemin([ // сжатие изображений
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
        .pipe(gulp.dest(path.build.img)); // выгрузка готовых файлов
});




gulp.task('watch', function () {
    // gulp.watch(path.watch.js, gulp.series('script:lib')).on('change', bSync.reload);//разобраться с путями
    gulp.watch(path.watch.js, gulp.series('script:main'));
    gulp.watch(path.watch.css, gulp.series('sass:build'));
    gulp.watch(path.watch.html, gulp.series('pug:build'));
});


gulp.task('default', gulp.series(
    gulp.series('clean:build'),
    gulp.parallel('pug:build', 'sass:build', 'script:main', 'image:build'),
    gulp.parallel('watch', 'bSync')
));