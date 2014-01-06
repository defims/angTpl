module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
            paths: ['.']
        },

        angularMobile: {
            options: {
                include: 'relative'
            },
            files: [
                {
                    src: [
                        'DefineProperty.polyfill.js',
                        'ArrayObserve.js',
                        'ElementBind.js',
                        'angularMobile.js'
                    ],
                    dest: 'dist/angularMobile.js'
                },{
                    src: [
                        'DefineProperty.polyfill.js',
                        'ArrayObserve.js',
                        'ElementBind.js',
                        'angularMobile.js'
                    ],
                    dest: 'dist/angularMobile-debug.js'
                }
            ]
        }
    },

    uglify: {
        angularMobile: {
            files: [
                {
                    expand: true,
                    cwd: 'dist',
                    src: ['*.js', '!*-debug.js'],
                    dest: './',
                    ext: '.min.js'
                }
            ]
        }
    }
  });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-clean');
    
    grunt.registerTask('default', ['concat:angularMobile','uglify:angularMobile']);

};
