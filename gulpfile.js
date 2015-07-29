var gulp = require('gulp');
var coffee = require('gulp-coffee');
var minify = require('gulp-minify');
var concat = require('gulp-concat-util');
var umd = require('gulp-umd');
var webpack = require('gulp-webpack');
var clone = require('gulp-clone');
var sourcemaps = require('gulp-sourcemaps');
var webpackModule = require('webpack')
var watch = require('gulp-watch');
var connect = require('gulp-connect');


gulp.task('default', function() {
	gulp.start(['build','demo','watch']);
});


gulp.task('watch', function () {
    watch(['./src/*.coffee'], function () {
        gulp.start(['build']);
    });
    watch(['./dist/viewlauncher.js','./demo/main.coffee'], function () {
        gulp.start(['build-demo']);
    });
});



gulp.task('build', function() {
  

	gulp.src([
		'src/elementsynchronizer.coffee',
		
		'src/pagemodel.coffee',
		'src/pagecollection.coffee',
		
		'src/viewcollection.coffee',
		'src/viewloader.coffee',

		'src/sectioncontent.coffee',
		'src/section.coffee',

		'src/launcher.coffee',
	])
		.pipe(concat('viewlauncher.js'))
		.pipe(sourcemaps.init())
		.pipe(coffee({bare:true,sourceMap:true}))
		.pipe(umd({
			dependencies: function(file) {
          		return [
					{	
						amd:'jquery',
						cjs:'jquery',
						name:'$'
					},
					{
						amd:'underscore',
						cjs:'underscore',
						name:'_'
					},
					{
						amd:'backbone',
						cjs:'backbone',
						name:'Backbone'
					}
				]
			},
			exports: function(file) {
          		return 'Launcher';
        	},        	
		}))
		.pipe(minify())	
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist'));

	

});


gulp.task('demo', function() {
	gulp.start(['build-demo','connect-demo','watch']);	
});


gulp.task('connect-demo', function () {
  connect.server({
    root: ['./demo'], //, 'tmp'],
    port: 8001,
    // livereload: true
  });
});


gulp.task('build-demo',function(){
	gulp.src('./demo/main.coffee')
		.pipe(webpack({ 
			plugins: [
				// new webpackModule.optimize.UglifyJsPlugin({minimize: true})
			],
			module: {
				loaders: [
					{ test: /\.coffee$/, loader: "coffee" },
					{ test: /\.css$/, loader: "style-loader!css-loader" },
				    { test: /\.png$/, loader: "url-loader?limit=100000&mimetype=image/png" },
				    { test: /\.jpg$/, loader: "file-loader" },
				    { test: /\.gif$/, loader: "file-loader" }
				],
				alias:{
					'':'coffee',
					'cs':'coffee'
				}
			},
			resolveLoaders: {
				alias:{
					'cs':'coffee'
				}
			},
			resolve: {
				extensions: ["", ".web.coffee", ".web.js", ".coffee", ".js"],
				alias:{
					'cs':'coffee'
				},
				modulesDirectories: [ './node_modules' ]
				
			},
			devtool: "source-map",
			output: {
				filename: "bundle.js"
			},
			externals: {
		        "jquery": "jQuery"
		    }
		 }))
        .pipe(gulp.dest('demo'));

})

