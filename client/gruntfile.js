module.exports = function(grunt) {

	grunt.initConfig({

	sass: {
		dist: {
			options: {
				style: 'compressed'
			},
			files: [{
				src: 'sass/main.scss',
				dest: 'css/main.css'
			}, {
				src: 'sass/theme.scss',
				dest: 'shared/libraries/jqueryUI/shortfall_theme/jquery-ui.css'
			}]
		}
	}, //sass task
	watch: {
		options: {
			spawn: false,
			livereload: true,
		},
		scripts: {
			files: ['sass/main.scss', 'sass/theme.scss', 'sass/**/*.scss'],
			tasks: ['sass']		
		}
	}, //watch task
	autoprefixer:{
  		dist:{
    		files:{
      			'css/main.css':'css/main.css'
    		}
  		}
	},//autoprefixer task
	browserSync: {
        dev: {
            bsFiles: {
                src : [
                    'css/*.css',
                    'sass/**/*.scss',
                    'home/*.html',
                    '*.html'
                ]
            },
            options: {
                watchTask: true,
                server: './'
            }
        }
    }, //browsersync task
    copy: {
    	main: {
    		files: [{
    			expand: true,
    			src: '../client/node_modules/core-js/client/shim.min.js',
    			dest: '../builds/production/js/libs/', 
    			flatten: true
    		},
    		{
    			expand: true,
    			src: '../client/node_modules/zone.js/dist/zone.min.js',
    			dest: '../builds/production/js/libs/',
    			flatten: true
    		},
    		{
    			expand: true,
    			src: '../client/node_modules/reflect-metadata/Reflect.js',
    			dest: '../builds/production/js/libs/',
    			flatten: true
    		},
    		{
    			expand: true,
    			src: '../client/node_modules/systemjs/dist/system.js',
    			dest: '../builds/production/js/libs/',
    			flatten: true
    		},
    		{
    			expand: true,
    			src: 'css/main.css',
    			dest: '../builds/production/css/',
    			flatten: true
    		},
    		{
    			expand: true,
    			src: 'index.html',
    			dest: '../builds/production/',
    			flatten: true
    		},
    		{
    			expand: true,
    			src: 'admin.html',
    			dest: '../builds/production/',
    			flatten: true
    		},
    		    		{
    			expand: true,
    			src: 'game.html',
    			dest: '../builds/production/',
    			flatten: true
    		},      
    		{
    			expand: true,
    			src: 'setGame.html',
    			dest: '../builds/production/',
    			flatten: true
    		},       
    		{
    			expand: true,
    			src: 'gameLogin.html',
    			dest: '../builds/production/',
    			flatten: true
    		},         	      		
    		{
    			expand: true,
    			src: '../client/node_modules/chart.js/dist/Chart.bundle.min.js',
    			dest: '../builds/production/js/libs/',
    			flatten: true
    		}]
    	}
    } //copy task


	}); //initConfig


grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-autoprefixer');
grunt.loadNpmTasks('grunt-browser-sync');
grunt.loadNpmTasks('grunt-contrib-copy');

grunt.registerTask('default', [ 'copy', 'browserSync', 'autoprefixer', 'sass',  'watch']);

};