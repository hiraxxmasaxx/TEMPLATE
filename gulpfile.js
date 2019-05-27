"use strict";

const gulp = require("gulp");
const connect = require('gulp-connect-php');
const del = require("del");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const nunjucks = require('gulp-nunjucks-render');
const beautify = require('gulp-html-beautify');
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const mqpacker = require('css-mqpacker');
const imagemin = require("gulp-imagemin");
const browsersync = require("browser-sync").create();
const uglify = require("gulp-uglify");

function connectSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function clean() {
  return del(
    [
      "./*.html",
      "./css/",
      "./js/*.js",
      "!./js/jquery-*.*.*.min.js",
      "./img/"
    ]
  );
}

function images() {
  return gulp
    .src("./src/img/**/*", {
      since: gulp.lastRun(images),
    })
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./img"));
}

function html(){
  return gulp
  .src(["./src/html/**/*.njk","!./src/html/**/_*.njk",])
  .pipe(nunjucks({
    path: "./src/html/"
  }))
  .pipe(beautify())
  .pipe(gulp.dest("./"))
}

function css() {
  return gulp
    .src("./src/css/**/*.scss")
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(postcss([mqpacker()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./css/"))
    .pipe(browsersync.stream());
}

function js() {
  return (
    gulp
      .src(["./src/js/**/*"])
      .pipe(plumber())
      .pipe(uglify())
      .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest("./js/"))
      .pipe(browsersync.stream())
  );
}

function watchFiles() {
  gulp.watch("./src/css/**/*", css);
  gulp.watch("./src/js/**/*", js);
  gulp.watch("./src/html/**/*", html);
  gulp.watch("./src/img/**/*", images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js ,images));
const watch = gulp.parallel(watchFiles, connectSync);

exports.images = images;
exports.html = html;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
