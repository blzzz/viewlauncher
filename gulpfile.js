var gulp = require('gulp');
var coffee = require('gulp-coffee');
var minify = require('gulp-minify');
// var concat = require('gulp-concat');
var defineModule = require('gulp-define-module');
var amdOptimize = require('gulp-amd-optimizer');
// var wrap = require('gulp-wrap');
var concat = require('gulp-concat-util');
var umd = require('gulp-umd');
var webpack = require('gulp-webpack');
var clone = require('gulp-clone');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('default', function() {
  

  // place code for your default task here


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
		.pipe(sourcemaps.write())
		.pipe(umd({
			dependencies: function(file) {
          		return [
					{	
						amd:'jquery',
						name:'$'
					},
					{
						amd:'backbone',
						name:'Backbone'
					},
					{
						amd:'underscore',
						name:'_'
					},
					{
						amd:'exports',
						name:'exports'
					}
				]
			},
			exports: function(file) {
          		return 'Launcher';
        	},        	
		}))
		.pipe(minify())	
		.pipe(gulp.dest('dist'));

	

});

gulp.task('demo',function(){
	gulp.src('./demo/main.coffee')
		.pipe(webpack({ 
			// plugins: [
			// 	new webpack.optimize.UglifyJsPlugin({minimize: true})
			// ],
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
		// .pipe(minify())
        .pipe(gulp.dest('demo'));

})

