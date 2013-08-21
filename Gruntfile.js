module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'amd-dist': {
      all: {
          options: {
              //remove requirejs dependency from built package (almond)
              standalone: false,
              //build standalone for node or browser
              env: 'browser',
              //env: 'browser',
              exports: 'subSync'
          },
          //Grunt files configuration object for which to trace dependencies
          //(more: http://gruntjs.com/configuring-tasks)
          files: [{
              src: 'lib/**/*.js',
              dest: 'dist/subSync.js'
          }]
      }
    },
    requirejs: {
      baseUrl: "."
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-amd-dist');

  // Default task(s).
  grunt.registerTask('default', ['amd-dist']);

};
