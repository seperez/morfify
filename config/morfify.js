var mobile,
    desktop,

mobile = {
    'js': [
        './src/models/test.model.js'
        // './src/app.js',

        // './build/tmpl/morfifyTmpl.js',

        // './src/utils/handlebars-helper.js',
        // './src/utils/utils.js',
        // './src/utils/url.js',

        // './src/morfify.module.js'
    ],
    'css': [],
    'tmpl': []
};

desktop = {
    'css': [],
    'tmpl': mobile.tmpl
};

/*
 * Expose
 */
exports.mobile = mobile;
exports.desktop = desktop;
