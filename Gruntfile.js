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
                cmd: 'rm -f coverage/lcov_addon_base.info && lcov --rc lcov_branch_coverage=0 --zerocounters --directory build && lcov --rc lcov_branch_coverage=0 --capture --initial --directory build --output-file coverage/lcov_addon_base.info'
            },

            cover: {
                cmd: "./node_modules/.bin/nyc -x Gruntfile.js -x 'test/**' ./node_modules/.bin/grunt test"
            },

            cover_lcov: {
                cmd: "rm -f coverage/lcov.info && ./node_modules/.bin/nyc report -r lcovonly && rm -f coverage/lcov_addon.info && lcov --rc lcov_branch_coverage=0 --capture --directory build --output-file coverage/lcov_addon.info && rm -f coverage/lcov_combined.info && lcov --rc lcov_branch_coverage=1 --add-tracefile coverage/lcov.info --add-tracefile coverage/lcov_addon_base.info --add-tracefile coverage/lcov_addon.info --output-file coverage/lcov_combined.info && rm -f coverage/lcov_final.info && lcov --rc lcov_branch_coverage=1 --remove coverage/lcov_combined.info '/usr/*' $PWD'/node_modules/*' --output-file coverage/lcov_final.info"
            },

            cover_report: {
                cmd: 'genhtml --rc lcov_branch_coverage=1 --demangle-cpp -o coverage/lcov-report coverage/lcov_final.info'
            },

            cover_check: {
                // lines% functions% branches%
                // Branches for C++ are disabled because gcov results are
                // messed up by exceptions.
                cmd: "if [ \"$(lcov --rc lcov_branch_coverage=1 --list coverage/lcov_final.info | grep Total | grep -o '[0-9.]\\+%' | tr '\\n' ' ')\" != '100% 100% 100% ' ]; then exit 1; fi"
            },

            codecov: {
                cmd: './node_modules/.bin/codecov -f coverage/lcov_final.info'
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
