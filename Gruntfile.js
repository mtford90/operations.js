module.exports = function (grunt) {


    var browsers = [{
        browserName: "firefox",
        version: "19",
        platform: "XP"
    }, {
        browserName: "googlechrome",
        platform: "XP"
    }, {
        browserName: "googlechrome",
        platform: "linux"
    }, {
        browserName: "internet explorer",
        platform: "WIN8",
        version: "10"
    }];

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
                    urls: ["http://127.0.0.1:9999/test-mocha/test/browser/opts.html"],
                    tunnelTimeout: 5,
                    concurrency: 3,
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
                    '<%= compile_dir %>/operations-<%= pkg.version %>.min.js': ['<%= build_dir %>/operation.js']
                }
            }
        },

        copy: {
            dist: {
                files: [
                    {src: '<%= build_dir %>/operation.js', dest: '<%= compile_dir %>/operations-<%= pkg.version %>.js'}
                ]
            }
        },

        clean: {
            build: '<%= build_dir %>',
            compile: '<%= compile_dir %>'
        },

        karmaconfig: {
            unit: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= test_files.js %>'
                ]
            }
        },

        delta: {
            node: {
                files: [
                    '<%= app_files.js %>',
                    '<%= app_files.jsunit %>'
                ],
                tasks: ['mochaTest']
            },
            browser: {
                files: [
                    '<%= app_files.js %>',
                    '<%= app_files.jsunit %>'
                ],
                tasks: [ 'build', 'karma:unit:run' ]
            }
        },

        browserify: {
            build: {
                files: {
                    '<%= build_dir %>/operation.js': ['src/index.js']
                }
            },
            // Bundle underscore for karma
            karma: {
                files: {
                    '<%= build_dir %>/operation-karma.js': ['src/index.js']
                }
            }
        },

        'replace' : {
            dist: {
                src: ['<%= build_dir %>/operation.js'],
                dest: '<%= build_dir %>/operation.js',
                replacements: [{
                    from: /^.*require.*underscore.*\n/g,
                    to: '\n'
                }]
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
        }



    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', [ 'mochaTest:test', 'delta:node' ]);

    grunt.registerTask('default', [ 'mochaTest:test', 'compile' ]);

    grunt.registerTask('build-test', [
        'karmaconfig',
        'browserify:karma'
    ]);

    grunt.registerTask('test', [
        'mochaTest:test'
    ]);

    grunt.registerTask('compile', [
        'browserify:build',
        'replace:dist',
        'uglify',
        'copy:dist'
    ]);

    grunt.registerTask('testBrowser', [
        'build-test',
        'karma:single'
    ]);

    grunt.registerTask('watchBrowser', ['build-test', 'karma:single', 'karma:continuous', 'delta:browser']);

    function filterForJS(files) {
        return files.filter(function (file) {
            return file.match(/\.js$/);
        });
    }

    grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
        var jsFiles = filterForJS(this.filesSrc);
        var process = function (contents, path) {
            return grunt.template.process(contents, {
                data: {
                    scripts: jsFiles
                }
            });
        };
        grunt.file.copy('karma/karma-unit.tpl.js', grunt.config('build_dir') + '/karma-unit.js', {
            process: process
        });

    });

    grunt.registerTask("dev", ["connect", "watch"]);

    grunt.registerTask("testSauce", ["connect", "saucelabs-mocha"]);


};
