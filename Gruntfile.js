"use strict";

module.exports = function (grunt)
{
    grunt.initConfig(
    {
        eslint: {
            target: [ 'Gruntfile.js', 'lib/**/*.js', 'test/**/*.js' ]
        },

        mochaTest: {
            src: 'test/*.js',
            options: {
                bail: true
            }
        },

        exec: {
            build: {
                cmd: 'node-gyp build --debug'
            },

            cover_build: {
                cmd: 'node-gyp rebuild --debug --coverage=true'
            },

            cover_init: {
                cmd: 'lcov --rc lcov_branch_coverage=0 --zerocounters --directory build'
            },

            cover: {
                cmd: "./node_modules/.bin/nyc -x Gruntfile.js -x 'test/**' node --napi-modules ./node_modules/.bin/grunt test"
            },

            cover_lcov: {
                cmd: "rm -f coverage/lcov.info && ./node_modules/.bin/nyc report -r lcovonly && rm -f coverage/lcov_addon.info && lcov --rc lcov_branch_coverage=0 --capture --directory build --output-file coverage/lcov_addon.info && rm -f coverage/lcov_addon2.info && lcov --rc lcov_branch_coverage=0 --remove coverage/lcov_addon.info '/usr/*' $PWD'/node_modules/*' --output-file coverage/lcov_addon2.info && rm -f coverage/lcov2.info && lcov --rc lcov_branch_coverage=1 --add-tracefile coverage/lcov.info --add-tracefile coverage/lcov_addon2.info --output-file coverage/lcov2.info"
            },

            cover_report: {
                cmd: 'genhtml --rc lcov_branch_coverage=1 --demangle-cpp -o coverage/lcov-report coverage/lcov2.info'
            },

            cover_check: {
                // lines% functions% branches%
                // Branches for C++ are disabled because gcov results are
                // messed up by exceptions.
                cmd: "if [ \"$(lcov --rc lcov_branch_coverage=1 --list coverage/lcov2.info | grep Total | grep -o '[0-9.]\\+%' | tr '\\n' ' ')\" != '100% 100% 100% ' ]; then exit 1; fi"
            },

            codecov: {
                cmd: './node_modules/.bin/codecov -f coverage/lcov2.info'
            },

            documentation: {
                cmd: './node_modules/.bin/documentation build -f html -o docs docs.js'
            },

            serve_documentation: {
                cmd: './node_modules/.bin/documentation serve -w docs.js'
            }
        }
    })

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('lint', 'eslint');
    grunt.registerTask('build', 'exec:build');
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('coverage', ['exec:cover_build',
                                    'exec:cover_init',
                                    'exec:cover',
                                    'exec:cover_lcov',
                                    'exec:cover_report',
                                    'exec:cover_check']);
    grunt.registerTask('codecov', 'exec:codecov');
    grunt.registerTask('docs', 'exec:documentation');
    grunt.registerTask('serve_docs', 'exec:serve_documentation');
};
