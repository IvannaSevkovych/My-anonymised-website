import gulp from 'gulp';
import config from '../config.js';
// import imagemin from 'gulp-imagemin';

gulp.task('copy:img', () => gulp
  .src([
    config.src.img + '/**/*.{jpg,png,jpeg,svg,gif}',
    '!' + config.src.img + '/svgo/**/*.*'
	])
	// .pipe(imagemin([], {
	// 	verbose: true
	// }))
  .pipe(gulp.dest(config.dest.img))
);

gulp.task('copy:icons', () => gulp
  .src(config.src.icons + '/*.{png,ico,webmanifest}')
  .pipe(gulp.dest(config.dest.icons))
);


gulp.task('copy:fonts', () => gulp
  .src(config.src.fonts + '/*.{ttf,eot,woff,woff2,json}')
  .pipe(gulp.dest(config.dest.fonts))
);

gulp.task('copy:models', () => gulp
  .src(config.src.models + '/*.{gltf,glb,bin,vtk}')
  .pipe(gulp.dest(config.dest.models))
);

gulp.task('copy:downloads', () => gulp
  .src(config.src.downloads + '/*.{txt,pdf}')
  .pipe(gulp.dest(config.dest.downloads))
);

gulp.task('copy:data', () => gulp
  .src(config.src.data + '/**/*.*')
  .pipe(gulp.dest(config.dest.data))
);

gulp.task('copy:lib', () => gulp
  .src(config.src.lib + '/**/*.*')
  .pipe(gulp.dest(config.dest.lib))
);

gulp.task('copy:rootfiles', () => gulp
  .src(config.src.root + '/*.*')
  .pipe(gulp.dest(config.dest.root))
);

const build = gulp => gulp.series('copy:img', 'copy:fonts', 'copy:models', 'copy:downloads', 'copy:icons');
const watch = gulp => () => gulp.watch(config.src.img + '/*', gulp.parallel('copy:img', 'copy:fonts', 'copy:models', 'copy:downloads', 'copy:icons'));

module.exports.build = build;
module.exports.watch = watch;
