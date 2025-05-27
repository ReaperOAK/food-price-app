const path = require('path');
const { 
  override,
  addWebpackPlugin,
  addBabelPlugin,
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
        deleteOriginalAssets: false,
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
      minSize: 5000, // Reduced from 20000
      maxSize: 15000, // Reduced from 40000
      cacheGroups: {
        core: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run|scheduler)[\\/]/,
          name: 'core',
          priority: 40,
          enforce: true,
        },
        chartjs: {
          test: /[\\/]node_modules[\\/]chart\.js[\\/]/,
          name: 'chartjs',
          chunks: 'async',
          priority: 30,
          enforce: true,
        },
        charts: {
          test: /[\\/]node_modules[\\/]react-chartjs-2[\\/]/,
          name: 'charts',
          chunks: 'async',
          priority: 29,
          enforce: true,
        },
        routing: {
          test: /[\\/]node_modules[\\/](@remix-run|react-router|react-router-dom)[\\/]/,
          name: 'routing',
          chunks: 'async',
          priority: 20,
          enforce: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          minSize: 5000,
          maxSize: 15000,
        },
      },
    },
    minimize: true,
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
