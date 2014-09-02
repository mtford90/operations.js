/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {

    build_dir: 'build',
    compile_dir: 'bin',
    test_dir: 'test',

    app_files: {
        js: [ 'src/**/*.js', '!src/**/*.spec.js'],
        jsunit: [ 'src/**/*.spec.js', 'test/**/*.spec.js' ]
    },

    test_files: {
        js: [
            'node_modules/sinon/pkg/sinon.js',
            'node_modules/sinon/pkg/sinon.js'
        ]
    },

    vendor_files: {
        js: [
            'node_modules/underscore/underscore.js'
        ]
    }
};
