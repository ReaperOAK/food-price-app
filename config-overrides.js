const path = require('path');
const { 
  override,
  addWebpackPlugin,
  addBabelPlugin,
  addBundleVisualizer,
  setWebpackOptimizationSplitChunks
} = require('customize-cra');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function override(config, env) {
  // Add gzip compression
  if (env === 'production') {
    config.plugins.push(
      new CompressionPlugin({
        test: /\.(js|css|html|svg)$/,
        algorithm: 'gzip',
      })
    );
  }
  // Configure optimization
  config.optimization = {
    ...config.optimization,
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 15000,
      maxSize: 40000,
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 40,
          enforce: true,
        },
        chartVendor: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
          name: 'chart-vendor',
          chunks: 'async',
          priority: 30,
          enforce: true,
        },
        helmetVendor: {
          test: /[\\/]node_modules[\\/](react-helmet|prop-types)[\\/]/,
          name: 'helmet-vendor',
          chunks: 'async',
          priority: 25,
          enforce: true,
        },
        routerVendor: {
          test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
          name: 'router-vendor',
          chunks: 'async',
          priority: 20,
          enforce: true,
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](intersection-observer|memoize-one|@babel\/runtime)[\\/]/,
          name: 'utility-vendor',
          chunks: 'async',
          priority: 15,
          enforce: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 10,
          enforce: true,
          reuseExistingChunk: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
            pure_getters: true,
            keep_infinity: true,
            passes: 3,
          },
          mangle: {
            safari10: true,
            toplevel: true,
            keep_classnames: false,
            keep_fnames: false,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        extractComments: false,
      }),
    ],
  };
  
  return config;
};
