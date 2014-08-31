module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var userConfig = require('./build.config.js');

    var taskConfig = {

        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner: '/**\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> - All Rights Reserved\n' +
                ' * Unauthorized copying of this file, via any medium is strictly prohibited\n' +
                ' * Proprietary and Confidential\n' +
                ' */\n'
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.spec.js', 'src/**/*.spec.js']
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
                },
                options: {
                    external: [
                        'underscore:_'
                    ]
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
        }

    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', [ 'mochaTest:test', 'delta:node' ]);

    grunt.registerTask('default', [ 'mochaTest:test', 'compile' ]);

    grunt.registerTask('build', [
        'browserify:build'
    ]);

    grunt.registerTask('test', [
        'mochaTest:test'
    ]);

    grunt.registerTask('compile', [
        'concat:compile_js',
        'uglify'
    ]);

    grunt.registerTask('testBrowser', [
        'build',
        'karma:single'
    ]);

    grunt.registerTask('watchBrowser', ['karma:single', 'karma:continuous',  'delta:browser']);

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


};
