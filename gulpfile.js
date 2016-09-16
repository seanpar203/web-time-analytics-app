/**
 * Created by Admin on 14/09/2016.
 */
'use strict';
const gulp = require('gulp');
const del = require('del');
var pump = require('pump');
var uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const runSequence = require('run-sequence');
const concatCss = require('gulp-concat-css');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync')
	.create();


const path = {
	js: [
		'assets/js/jquery-3.1.0.min.js',
		'assets/js/d3.min.js',
		'assets/js/d3pie.min.js',
		'assets/js/uuid.js',
		'assets/js/time-spent.js'
	],
	sass: 'assets/sass/*.scss',
	dist: './dist/'
};

gulp.task('scripts', function () {
	return gulp.src(path.js)
	           .pipe(concat('app.js'))
	           .pipe(gulp.dest(path.dist));
});


gulp.task('clean', function () {
	return del(path.dist)
});

gulp.task('sass', function () {
	return gulp.src(path.sass)
	           .pipe(sass())
	           .pipe(cleanCSS('app.css'))
	           .pipe(gulp.dest(path.dist));
});

gulp.task('watch', function () {
	gulp.watch(path.sass, ['sass']);
	gulp.watch(path.js, ['scripts']);
});

gulp.task('default', function () {
	runSequence('clean', [
		'sass',
		'scripts'
	], 'watch');
});