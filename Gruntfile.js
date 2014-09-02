var _ = require('underscore');

module.exports = function (grunt) {


    var browsers = [

        {
            browserName: "internet explorer",
            platform: "WIN8.1",
            'version': "11"
        },
        {
            browserName: "internet explorer",
            platform: "WIN8",
            'version': "10"
        },
        {
            "browserName": "firefox",
            "platform": "WIN8.1",
            "version": "31"
        },
        {
            "browserName": "googlechrome",
            "platform": "WIN8.1",
            "version": "37"
        },
        {
            "browserName": "googlechrome",
            "platform": "WIN8.1",
            "version": "30"
        },
        {
            browserName: "internet explorer",
            platform: "WIN7",
            'version': "11"
        },
        {
            browserName: "internet explorer",
            platform: "WIN7",
            'version': "10"
        },
        {
            "browserName": "firefox",
            "platform": "WIN7",
            "version": "31"
        },
        {
            "browserName": "googlechrome",
            "platform": "WIN7",
            "version": "37"
        },
        {
            "browserName": "googlechrome",
            "platform": "WIN7",
            "version": "30"
        },
                {
            "browserName": "safari",
            "platform": "WIN7",
            "version": "5"
        },
        {
            "browserName": "googlechrome",
            "platform": "OS X 10.9",
            "version": "35"
        },
        {
            "browserName": "firefox",
            "platform": "OS X 10.9",
            "version": "30"
        },
        {
            "browserName": "firefox",
            "platform": "linux",
            "version": "31"
        }
        ,
        {
            "browserName": "googlechrome",
            "platform": "linux",
            "version": "36"
        },
        {
            "browserName": "googlechrome",
            "platform": "OS X 10.8",
            "version": "35"
        },
        {
            "browserName": "safari",
            "platform": "OS X 10.8",
            "version": "6"
        },
        {
            "browserName": "iphone",
            "platform": "OS X 10.9",
            "version": "7.1",
            "deviceName": 'iPhone',
            'device-orientation': 'portrait'
        },
        {
            "browserName": "iphone",
            "platform": "OS X 10.9",
            "version": "7.0",
            "deviceName": 'iPhone',
            'device-orientation': 'portrait'
        },
        {
            "browserName": "iphone",
            "platform": "OS X 10.8",
            "version": "6.1",
            "deviceName": 'iPhone',
            'device-orientation': 'portrait'
        }
,
        {
            "browserName": "ipad",
            "platform": "OS X 10.9",
            "version": "7.1",
            "deviceName": 'iPad',
            'device-orientation': 'portrait'
        },
        {
            "browserName": "ipad",
            "platform": "OS X 10.9",
            "version": "7.0",
            "deviceName": 'iPad',
            'device-orientation': 'portrait'
        }
,
        {
            "browserName": "ipad",
            "platform": "OS X 10.8",
            "version": "6.1",
            "deviceName": 'iPad',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.4',
            'deviceName': 'Android',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.4',
            'deviceName': 'Google Nexus 7 HD Emulator',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.4',
            'deviceName': 'LG Nexus 4 Emulator',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.3',
            'deviceName': 'Android',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.3',
            'deviceName': 'Samsung Galaxy S3 Emulator',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.2',
            'deviceName': 'Android',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.2',
            'deviceName': 'Samsung Galaxy Tab 3 Emulator',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.1',
            'deviceName': 'Android',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.1',
            'deviceName': 'HTC One X',
            'device-orientation': 'portrait'
        },
        {
            'browserName': 'android',
            'platform': 'Linux',
            'version': '4.0',
            'deviceName': 'Samsung Galaxy Note Emulator',
            'device-orientation': 'portrait'
        }


    ];


    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var userConfig = require('./build.config.js');

    var taskConfig = {

        connect: {
            server: {
                options: {
                    base: "",
                    port: 9999
                }
            }
        },

        'saucelabs-mocha': {
            all: {
                options: {
                    urls: ["http://127.0.0.1:9999/test/index.html"],
                    tunnelTimeout: 5,
                    concurrency: 3,
                    build: process.env.TRAVIS_JOB_ID,
                    browsers: browsers,
                    testname: "mocha tests"
                }
            }
        },

        pkg: grunt.file.readJSON("package.json"),

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.spec.js', 'src/**/*.spec.js']
            }
        },

        uglify: {
            options: {
                mangle: true
            },
            dist: {
                files: {
                    '<%= compile_dir %>/operations.min.js': ['<%= build_dir %>/operation.js']
                }
            }
        },

        copy: {
            dist: {
                files: [
                    {src: '<%= build_dir %>/operation.js', dest: '<%= compile_dir %>/operations.js'}
                ]
            }
        },

        clean: {
            build: '<%= build_dir %>',
            compile: '<%= compile_dir %>'
        },

        delta: {
            options: {
                livereload: true
            },
            node: {
                files: [
                    '<%= app_files.js %>',
                    '<%= app_files.jsunit %>'
                ],
                tasks: ['test']
            }
        },

        browserify: {
            build: {
                files: {
                    '<%= build_dir %>/operation.js': ['src/index.js']
                }
            }
        },

        karma: {
            continuous: {
                configFile: '<%= build_dir %>/karma-unit.js',
                singleRun: false,
                background: true,
                port: 9019
            },
            unit: {
                configFile: '<%= build_dir %>/karma-unit.js',
                port: 9019
            },
            single: {
                configFile: '<%= build_dir %>/karma-unit.js',
                singleRun: true
            }
        },

        index: {
            build: {
                dir: '<%= test_dir %>',
                src: [
                    '<%= test_dir %>/**/*.spec.js'
                ]
            }
        }
    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', [ 'index', 'connect', 'mochaTest:test', 'delta' ]);

    grunt.registerTask('test', [
        'index',
        'mochaTest:test'
    ]);

    grunt.registerTask('build', [
        'browserify:build'
    ]);

    grunt.registerTask('compile', [
        'browserify:build',
        'uglify',
        'copy:dist'
    ]);

    function filterForJS(files) {
        return files.filter(function (file) {
            return file.match(/\.js$/);
        });
    }


    grunt.registerTask("testSauce", ['browserify:build', "connect", "index", "saucelabs-mocha"]);


    grunt.registerMultiTask('index', 'Process index.html template', function () {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');
        var jsFiles = filterForJS(this.filesSrc).map(function (file) {
            return '../' + file.replace(dirRE, '');
        });

        grunt.file.copy('test/index.tpl.html', this.data.dir + '/index.html', {
            process: function (contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        specs: jsFiles
                    }
                });
            }
        });

    });


};