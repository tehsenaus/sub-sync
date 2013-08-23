module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          // use the quiet flag to suppress the mocha console output
          quiet: true,
          // specify a destination file to capture the mocha
          // output (the quiet option does not suppress this)
          captureFile: 'build/coverage.html'
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('bower-amd-dist');

  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('build', ['bower-amd-dist']);

  // Default task(s).
  grunt.registerTask('default', ['test', 'build']);

};
