/**
 * Gulp configuration file. Commands are:
 *   'gulp' - Runs the default task (gulp develop).
 *   'gulp develop' or 'gulp dev' - Runs in development mode (watches for changes in files).
 * 	 'gulp build' - Builds the dist folder.
 * 	 'gulp deploy' - Builds the dist folder and syncs it with a web server.
 *   'gulp github' - Pushes the dist folder to the gh-pages branch for Github Pages.
 */

// gulp plugins
const del = require('del'),
	ghpages = require('gh-pages'),
	gulp = require('gulp'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	rsync = require('gulp-rsync'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps');

// globals
let resources = {
		static: [
			'./src/**/*',
			// ignore
			'!./src/**/*.scss',
			'!./src/**/_backup/**/*',
			// add back in lib folders and files
			'./src/**/lib/**/*'
		],
		styles: [
			'./src/**/*.scss',
			// ignore
			'!./src/**lib/**/*',
			'!./src/**/_backup/**/*'
		]
	},
	rsyncConf = {
		root: './dist/',
		hostname: 'your_hostname_here',
		username: 'your_username_here',
		shell: 'your_shell_here',
		destination: 'your_destination_here',
		silent: false
	};

/**
 * Deletes the dist folder.
 */
function cleanDist() {
	return del(['./dist/']);
}

/**
 * Syncs the dist folder with the web server specified in rsyncConf.
 */
function deploy() {
	return gulp
		.src('./dist/**')
		.pipe(getPlumber())
		.pipe(rsync(rsyncConf));
}

/**
 * Creates and returns a generic plumber error handling instance.
 */
function getPlumber() {
	return plumber({
		// handle any errors running this task
		errorHandler: function(error) {
			notify.onError({
				title: 'Gulp error in ' + error.plugin,
				message: error.toString()
			})(error);
			this.emit('end'); // to call the next pipe in the task pipeline
		}
	});
}

/**
 * Pushes the dist folder to the gh-pages branch for Github Pages.
 */
function github(done) {
	ghpages.publish('./dist', done);
}

/**
 * Copies folders and files that don't need compilation or transpilation to the dist folder.
 */
function static() {
	return gulp
		.src(resources.static, {
			base: './src/',
			nodir: true
		})
		.pipe(getPlumber())
		.pipe(gulp.dest('./dist/'));
}

/**
 * Processes all SCSS and CSS files:
 *   - Compiles SCSS
 *   - Minifies
 *   - Bundles all styles into one file (all.min.css)
 *   - Creates sourcemaps
 *   - Copies to the dist folder
 */
function styles() {
	return gulp
		.src(resources.styles, {
			base: './src/'
		})
		.pipe(getPlumber())
		.pipe(sourcemaps.init()) // initialize sourcemaps for .min.css files
		.pipe(sass({ outputStyle: 'compressed' })) // compile sass
		.pipe(sourcemaps.write('maps')) // generate sourcemap for the bundle
		.pipe(gulp.dest('./dist/'));
}

/**
 * Watches files for changes and runs the appropriate task when changes occur.
 */
function watch(done) {
	gulp.watch(resources.static, static);
	gulp.watch(resources.styles, styles);
	done();
}

// group common build tasks together
const build = gulp.series(cleanDist, gulp.parallel(static, styles));

// these tasks are publicly available
exports.build = gulp.series(build);
exports.deploy = gulp.series(build, deploy);
exports.develop = exports.dev = gulp.series(build, watch);
exports.github = gulp.series(build, github);
exports.default = exports.develop;
