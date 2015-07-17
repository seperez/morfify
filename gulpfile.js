var path = require('path'),
    gulp = require('gulp'),
    merge = require('arr-merge'),
    del = require('del'),
    runSequence = require('run-sequence'),
    mkdirp = require('mkdirp'),
    $ = require('gulp-load-plugins')(),

    src = {
        'root':'./src/',
        'build':{
            'root': './build/',
            'styles': './build/',
            'scripts': './build/',
            'images': './build/images/',
            'fonts': './build/fonts/',
            'tmpl': './build/tmpl/',
            'i18n': './build/i18n/'
        },
        'dist':{
            'root': './dist/',
            'styles': './dist/',
            'scripts': './dist/',
            'images': './dist/images/',
            'fonts': './dist/fonts/',
            'manifest': './dist/'
        }
    },

    assets = {
        'default': require('./config/default'),
        'morfify': require('./config/morfify')
    },

    bundles = {
        js: {
            'morfify': merge(assets.default.js, assets.morfify.mobile.js)
        },
        css: {
            'morfify': assets.morfify.mobile.css
        },
        tmpl: {
            'morfify': assets.morfify.mobile.tmpl
        }
    };

//Tasks for build

gulp.task('tmplBuild', function() {
    mkdirp.sync(src.build.tmpl);

    Object.keys(bundles.tmpl).forEach(function(bundle) {
        return gulp.src(bundles.tmpl[bundle])
            .pipe($.handlebars())
            .pipe($.wrap('Handlebars.template(<%= contents %>)'))
            .pipe($.declare({
                namespace: '__templates',
                noRedeclare: true,
            }))
            .pipe($.concat(bundle + 'Tmpl.js'))
            .pipe($.size({
                title: 'Templates size:'
            }))
            .pipe(gulp.dest(src.build.tmpl));
    });
});

gulp.task('jsLinting', function() {
    gulp.src(src.root + '**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
});

gulp.task('jsBuild', function() {
    setTimeout(function(){
        Object.keys(bundles.js).forEach(function(bundle) {
            return gulp.src(bundles.js[bundle])
                .pipe($.concat(bundle + '.js'))
                .pipe($.size({
                    title: bundle + '.js size: '
                }))
                .pipe(gulp.dest(src.build.scripts));
        });
    },1000);
});

gulp.task('cssBuild', function() {
    Object.keys(bundles.css).forEach(function(bundle) {
        return gulp.src(bundles.css[bundle])
            .pipe($.sass({
                style: 'expanded'
            }))
            .pipe($.postcss([
                require('autoprefixer-core')({
                    browsers: ['last 8 versions', 'ie 8']
                })
            ]))
            .pipe($.concat(bundle + '.css'))
            .pipe($.size({
                title: bundle + '.css size: '
            }))
            .pipe(gulp.dest(src.build.styles));
    });
});

gulp.task('imageBuild', function() {
    mkdirp.sync(src.build.images);

    return gulp.src([
            src.build.images + '/*.png',
            src.build.images + '/*.gif',
            src.build.images + '/*.jpg'
        ])
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe($.size({
            title: 'Images size:'
        }))
        .pipe(gulp.dest(src.build.images))
});

gulp.task('fontBuild', function() {
    mkdirp.sync(src.build.fonts);

    return gulp.src([
        src.build.fonts + '*.eot',
        src.build.fonts + '*.svg',
        src.build.fonts + '*.ttf',
        src.build.fonts + '*.woff'
    ])
    .pipe(gulp.dest(src.build.fonts))
});

gulp.task('cleanBuild', function() {
    del.sync([src.build.root + '*']);
});

//Tasks for dist
gulp.task('jsDist', function() {
    return gulp.src(src.build.scripts + '*.js')
        .pipe($.foreach(function(stream, file){
            var fileName = path.basename(file.path, '.js');

            return stream
                .pipe($.uglify())
                .pipe($.size({
                    title: fileName + '.js minified size: '
                }))
                .pipe(gulp.dest(src.dist.scripts));
        }));
});

gulp.task('cssDist', function() {
    return gulp.src(src.build.styles + '*.css')
        .pipe($.foreach(function(stream, file){
            var fileName = path.basename(file.path, '.css');

            return stream
                .pipe($.postcss([
                    require('csswring')({
                        preserveHacks: true
                    })
                ]))
                .pipe($.size({
                    title: fileName + '.css minified size: '
                }))
                .pipe(gulp.dest(src.dist.styles));
        }));
});

gulp.task('imageDist', function() {
    mkdirp.sync(src.dist.images);

    return gulp.src(src.build.images)
    .pipe(gulp.dest(src.dist.images));
});

gulp.task('fontDist', function() {
    mkdirp.sync(src.dist.fonts);

    return gulp.src(src.build.fonts)
    .pipe(gulp.dest(src.dist.fonts));
});

gulp.task('revisionDist',function(){
    var unRevFiles = gulp.src(src.dist.root + '*');

    gulp.src(src.dist.root + '*')
        .pipe($.rev())
        // .pipe($.gzip())
        .pipe(gulp.dest(src.dist.root))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(src.dist.root))
    
    unRevFiles.
        pipe($.rimraf());
});

gulp.task("revisionReplace", function(){
    setTimeout(function(){
        var manifest = gulp.src(src.dist.manifest + "rev-manifest.json");

        return gulp.src("index.html")
            .pipe($.revReplace({
                manifest: manifest,
                modifyUnreved: function (filename) {
                    return '/build/' + filename;
                }
            }))
            .pipe(gulp.dest(src.dist.root));
    },200);
});

gulp.task('cleanDist', function() {
    del.sync([src.dist.root]);
});

//Public Tasks
gulp.task('build',function(){
    runSequence(
        'cleanBuild',
        'tmplBuild',
        ['fontBuild', 'imageBuild'],
        ['imageBuild'],
        'cssBuild',
        'jsLinting',
        'jsBuild'
    );
});

gulp.task('dist',function(){
    runSequence(
        'cleanDist',
        ['jsDist', 'cssDist'],
        // ['fontDist', 'imageDist'],
        'revisionDist',
        'revisionReplace'
    );
});

gulp.task('watch', function() {
    gulp.start('build');
    gulp.watch(['./src/styles/**/*.scss'], ['cssBuild']);
    gulp.watch(['./src/images/**/*'], ['images']);
    gulp.watch([
        'gulpfile.js',
        './config/*.js',
        './src/**/*.js',
        './src/templates/*.hbs',
        'mocks/mock.js'
    ], function(){
        runSequence(
            'tmplBuild',
            'jsBuild'
        );
    });
});

gulp.task('deploy',function(){
    return gulp.src('./dist/**/*')
        .pipe($.ghPages({
            message: 'Automatic gh-pages deploy'
        }));
});
