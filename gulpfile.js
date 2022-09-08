//Подключаем галп
const gulp = require('gulp');
//Объединение файлов
const concat = require('gulp-concat');
//Добапвление префиксов
const autoprefixer = require('gulp-autoprefixer');
//Оптимизация стилей
const cleanCSS = require('gulp-clean-css');
//Оптимизация скриптов
const uglify = require('gulp-uglify');
//Удаление файлов
const del = require('del');
//Синхронизация с браузером
const browserSync = require('browser-sync').create();
//Для препроцессоров стилей
const sourcemaps = require('gulp-sourcemaps');
//Sass препроцессор
const sass = require('gulp-sass')(require('sass'));
//Less препроцессор
const less = require('gulp-less');
//Stylus препроцессор
const stylus = require('gulp-stylus');
//Модуль для сжатия изображений
const imagemin = require('gulp-imagemin');
//Модуль переименовывания файлов
const rename = require('gulp-rename');
// const babel = require('gulp-babel');
const webpack = require('webpack-stream');

//Порядок подключения файлов со стилями
const styleFiles = ['./src/assets/scss/style.scss'];
//Порядок подключения js файлов
const scriptFiles = ['./src/js/main.js'];

//Таск для обработки стилей
gulp.task('styles', () => {
  //Шаблон для поиска файлов CSS
  //Все файлы по шаблону './src/css/**/*.css'
  return (
    gulp
      .src(styleFiles)
      .pipe(sourcemaps.init())
      //Указать stylus(), sass() или less()
      .pipe(sass())
      //Объединение файлов в один
      .pipe(concat('style.css'))
      //Добавить префиксы
      .pipe(
        autoprefixer({
          cascade: false,
        }),
      )
      //Минификация CSS
      .pipe(
        cleanCSS({
          level: 2,
        }),
      )
      .pipe(sourcemaps.write('./'))
      .pipe(
        rename({
          suffix: '.min',
        }),
      )
      //Выходная папка для стилей
      .pipe(gulp.dest('./build/css'))
      .pipe(browserSync.stream())
  );
});

//Таск для обработки скриптов
gulp.task('scripts', () => {
  return gulp
    .src('./src/js/main.js')
    .pipe(
      webpack({
        mode: 'development',
        output: {
          filename: 'script.js',
        },
        watch: false,
        devtool: 'source-map',
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        debug: true,
                        corejs: 3,
                        useBuiltIns: 'usage',
                      },
                    ],
                  ],
                },
              },
            },
          ],
        },
      }),
    )
    .pipe(gulp.dest('./build/js'));
});
// gulp.task('scripts', () => {
//    //Шаблон для поиска файлов JS
//    //Все файлы по шаблону './src/js/**/*.js'
//    return gulp.src(scriptFiles)
//    .pipe(webpack({
//       mode: 'development',
//       output: {
//           filename: 'main.js'
//       },
//       watch: false,
//       devtool: "source-map",
//       module: {
//           rules: [
//             {
//               test: /\.m?js$/,
//               exclude: /(node_modules|bower_components)/,
//               use: {
//                 loader: 'babel-loader',
//                 options: {
//                   presets: [['@babel/preset-env', {
//                       debug: true,
//                       corejs: 3,
//                       useBuiltIns: "usage"
//                   }]]
//                 }
//               }
//             }
//           ]
//         }
//   }))
//    // .pipe(sourcemaps.init())

//    //Объединение файлов в один
//    // .pipe(concat('main.js'))
//    // .pipe(sourcemaps.write('.'))
//       //Минификация JS
//       // .pipe(uglify({
//          toplevel: true
//       // }))
//       // .pipe(rename({
//       //    suffix: '.min'
//       // }))
//       //Выходная папка для скриптов
//       .pipe(gulp.dest('./build/js'))
//       .pipe(browserSync.stream());
// });

//Таск для очистки папки build
gulp.task('del', () => {
  return del(['build/*']);
});

//Таск для сжатия изображений
gulp.task('img-compress', () => {
  return gulp
    .src('./src/assets/images/**')
    .pipe(
      imagemin({
        progressive: true,
      }),
    )
    .pipe(gulp.dest('./build/images/'));
});

//Таск для отслеживания изменений в файлах
gulp.task('watch', () => {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
  //Следить за добавлением новых изображений
  gulp.watch('./src/assets/images/**', gulp.series('img-compress'));
  //Следить за файлами со стилями с нужным расширением
  gulp.watch('./src/aseets/scss/**/*.scss', gulp.series('styles'));
  //Следить за JS файлами
  gulp.watch('./src/js/**/*.js', gulp.series('scripts'));
  //При изменении HTML запустить синхронизацию
  gulp.watch('./*.html').on('change', browserSync.reload);
});

//Таск по умолчанию, Запускает del, styles, scripts, img-compress и watch
gulp.task(
  'default',
  gulp.series('del', gulp.parallel('styles', 'scripts', 'img-compress'), 'watch'),
);
