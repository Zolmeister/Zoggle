module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      lib: {
        // order matters because jQuery needs to come before angular
        src: ['public/lib/*.js', 'public/lib/angular/**/*.js'],
        dest: 'public/dist/lib.js'
      },
      zoggle: {
        src: ['public/js/**/*.js'],
        dest: 'public/dist/zoggle.js'
      }
    },
    ngmin: {
      zoggle: {
        src: ['<%= concat.zoggle.dest %>'],
        dest: 'public/dist/zoggle.ngmin.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      lib: {
        options: {
          sourceMap: 'public/dist/lib.js.map',
          sourceMappingURL: 'dist/lib.js.map',
          sourceMapPrefix: 1
        },
        files: {
          'public/dist/lib.min.js': ['<%= concat.lib.dest %>']
        }
      },
      zoggle: {
        options: {
          sourceMap: 'public/dist/zoggle.js.map',
          sourceMappingURL: 'dist/zoggle.js.map',
          sourceMapPrefix: 1
        },
        files: {
          'public/dist/zoggle.min.js': ['<%= ngmin.zoggle.dest %>']
        }
      }
    }
  });

  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ngmin');

  grunt.registerTask('default', ['concat', 'ngmin', 'uglify']);

};