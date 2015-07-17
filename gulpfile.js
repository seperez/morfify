var path = require('path'),
    gulp = require('gulp'),
    merge = require('arr-merge'),
    del = require('del'),
    runSequence = require('run-sequence'),
    mkdirp = require('mkdirp'),
    $ = require('gulp-load-plugins')(),

    src = {
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
    mkdirp(src.build.tmpl);

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
    gulp.src('./backbone-app/**/*.js')
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
    mkdirp(src.build.images);

    return gulp.src([
            'backbone-app/assets/*.png',
            'backbone-app/assets/*.gif',
            'backbone-app/assets/*.jpg'
        ])
        // .pipe($.imagemin({
        //     progressive: true,
        //     interlaced: true
        // }))
        .pipe($.size({
            title: 'Images size:'
        }))
        .pipe(gulp.dest(src.build.images))
});

gulp.task('fontBuild', function() {
    mkdirp(src.build.fonts);

    return gulp.src([
        'backbone-app/assets/*.eot',
        'backbone-app/assets/*.svg',
        'backbone-app/assets/*.ttf',
        'backbone-app/assets/*.woff'
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
    mkdirp(src.dist.images);

    return gulp.src(src.build.images)
    .pipe(gulp.dest(src.dist.images));
});

gulp.task('fontDist', function() {
    mkdirp(src.dist.fonts);

    return gulp.src(src.build.fonts)
    .pipe(gulp.dest(src.dist.fonts));
});

gulp.task('revisionDist',function(){
    gulp.src(src.dist.root + '*')
        .pipe($.rev())
        .pipe($.gzip())
        .pipe(gulp.dest(src.dist.root))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(src.dist.root))
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
        'cssBuild',
        'jsLinting',
        'jsBuild'
    );
});

gulp.task('dist',function(){
    runSequence(
        'cleanDist',
        ['jsDist', 'cssDist'],
        ['fontDist', 'imageDist'],
        'revisionDist'
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
