const webpack = require('webpack');
const path = require('path');
const config = require('./gulp/config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function createConfig(env) {
  let isProduction,
    webpackConfig;

  if (env === undefined) {
    env = process.env.NODE_ENV;
  }

  isProduction = env === 'production';

  webpackConfig = {
    mode: isProduction ? 'production' : 'development',
    context: path.join(__dirname, config.src.js),
    entry: {
      // vendor: ['jquery'],
      // app: './app.js',
      main: './main.js',
      about_me: './about_me.js',
      portfolio: './portfolio.js',
      portfolio_vis: './portfolio_vis.js',
      portfolio_codes: './portfolio_codes.js',
      portfolio_codes_distortion: './portfolio_codes_distortion.js',
      portfolio_codes_masonry: './portfolio_codes_masonry.js',
      portfolio_codes_morphoDots: './portfolio_codes_morphoDots.js',
      portfolio_codes_rex: './portfolio_codes_rex.js',
      portfolio_codes_volcano: './portfolio_codes_volcano.js',
    },
    output: {
      path: path.join(__dirname, config.dest.js),
      filename: '[name].js',
      publicPath: 'js/',
    },
    devtool: isProduction ?
      '#source-map' :
      '#cheap-module-eval-source-map',
    plugins: [
      // new webpack.optimize.CommonsChunkPlugin({
      //     name: 'vendor',
      //     filename: '[name].js',
      //     minChunks: Infinity
      // }),
      new webpack.LoaderOptionsPlugin({
        options: {
          eslint: {
            formatter: require('eslint-formatter-pretty')
          }
        }
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      }),
      new webpack.NoEmitOnErrorsPlugin(),

      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        analyzerPort: 4000,
        openAnalyzer: false,
      }),
    ],
    resolve: {
      extensions: ['.js'],
      alias: {
        ScrollMagic: path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
        'animation.gsap': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
        'debug.addIndicators': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js'),
      },
    },
    optimization: {
      minimize: isProduction
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: [
            path.resolve(__dirname, 'node_modules'),
          ],
          loader: 'eslint-loader',
          options: {
            emitWarning: true,
            failOnWarning: false,
            fix: true,
            cache: true,
            ignorePattern: __dirname + '/src/js/lib/'
          }
        }, {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [
            path.resolve(__dirname, 'node_modules'),
          ],
        },
        { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
        { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ }
      ],
    },
  };

  if (isProduction) {
    webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      })
    );
  }

  return webpackConfig;
}

module.exports = createConfig();
module.exports.createConfig = createConfig;
