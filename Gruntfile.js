module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  grunt.loadNpmTasks('bower-amd-dist');

  // Default task(s).
  grunt.registerTask('default', ['bower-amd-dist']);

};
