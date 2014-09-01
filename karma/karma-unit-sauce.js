module.exports = function (karma) {

    var customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 7',
            version: '35'
        }
    };
    karma.set({
        basePath: '../',
        files: [
            'node_modules/underscore/underscore.js',
            'node_modules/sinon/pkg/sinon.js',
            'build/operation-karma.js',
            'test/**/*.js'
        ],
        exclude: [
        ],
        frameworks: [ 'mocha', 'chai' ],
        plugins: [ 'karma-mocha',
            'karma-chai-things',
            'karma-chai',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-sauce-launcher'
        ],
        port: 9876,
        colors: true,
        reporters: ['dots', 'saucelabs'],
        captureTimeout: 120000,
        urlRoot: '/',
        sauceLabs: {
            testName: 'Web App Unit Tests',
            username: 'mtford',
            accessKey: 'f712692f-cef1-4bd3-b525-4b032db4036f',
            startConnect: false
        },
        autoWatch: false,
        browsers: Object.keys(customLaunchers),
        customLaunchers: customLaunchers,
        singleRun: true,
        logLevel: karma.LOG_INFO

    });
};

