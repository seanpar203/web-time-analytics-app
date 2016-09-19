/**
 * Created by Admin on 14/09/2016.
 */
'use strict';
const gulp = require('gulp');
const del = require('del');
const pump = require('pump');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const runSequence = require('run-sequence');
const concatCss = require('gulp-concat-css');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();


const globs = {
	prod: 'public/',
	js:   [
		'assets/js/jquery-3.1.0.min.js',
		'assets/js/d3.min.js',
		'assets/js/d3pie.min.js',
		'assets/js/uuid.js',
		'assets/js/time-spent.js'
	],
	sass: 'assets/sass/*.scss',
	html: 'assets/html/*.html',
	css:  'semantic/dist/semantic.min.css'
};
gulp.task('clean', function () {
	return del(globs.prod)
});

gulp.task('scripts', function () {
	return gulp.src(globs.js)
		.pipe(concat('app.js'))
		.pipe(gulp.dest(globs.prod));
});

gulp.task('html', function () {
	return gulp.src(globs.html)
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(globs.prod))
});

gulp.task('sass', function () {
	return gulp.src(globs.sass)
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(gulp.dest(globs.prod));
});

gulp.task('css', function () {
	return gulp.src(globs.css)
		.pipe(gulp.dest(globs.prod));
});

gulp.task('watch', function () {
	gulp.watch(globs.sass, ['sass']);
	gulp.watch(globs.html, ['html']);
	gulp.watch(globs.js, ['scripts']);
});

gulp.task('default', function () {
	runSequence('clean', [
		'html',
		'sass',
		'scripts',
		'css'
	], 'watch');
});