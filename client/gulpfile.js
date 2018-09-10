var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';


// gulp default that will execute all tasks related to watching change and copying change to dist
gulp.task('default', ['copy-html','inject-favicon-markups', 'copy-images', 'copy-styles', 'copy-js', 'copy-sw'], function() {
    gulp.watch('src/css/*.css', ['copy-styles']);
    gulp.watch('src/js/*.js', ['copy-js']);
    gulp.watch('src/index.html', ['copy-html','inject-favicon-markups']);
    gulp.watch('src/restaurant.html', ['copy-html','inject-favicon-markups']);
    gulp.watch('./dist/index.html').on('change', browserSync.reload);
    gulp.watch('src/sw.js', ['copy-sw']);

	browserSync.init({
		server: "./dist"
	});
	browserSync.stream();
});

// task to copy all code to dist
gulp.task('dist', [
    'copy-html',
    'copy-images',
    'copy-styles',
    'copy-js'
]);

// task to copy js from src to dist
gulp.task('copy-js', function() {
    gulp.src('src/js/*.js')
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

// task to copy html file from src to dist
gulp.task('copy-html', function() {
    gulp.src(['src/index.html','src/restaurant.html'])
        .pipe(gulp.dest('./dist'));
});

// task to copy images from src to dist
gulp.task('copy-images', function() {
    gulp.src('src/img/*')
        .pipe(gulp.dest('dist/img'));
});

// task to copy styles from src to dist
gulp.task('copy-styles', function() {
    gulp.src('src/css/*.css')
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

// task to copy service worker file from src to dist
gulp.task('copy-sw', function() {
    gulp.src('src/sw.js')
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'src/img/spaguetti.png',
        dest: 'dist/img',
        iconsPath: '/img',
        design: {
            ios: {
                pictureAspect: 'noChange',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false,
            readmeFile: false,
            htmlCodeFile: false,
            usePathAsIs: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
    return gulp.src([ 'src/index.html','src/restaurant.html' ])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('./dist'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});