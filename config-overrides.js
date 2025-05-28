const path = require('path');
const { 
  override,
  addWebpackPlugin
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
        deleteOriginalAssets: false
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
      minSize: 2000,
      maxSize: 8000,
      cacheGroups: {
        core: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'core',
          priority: 40,
          enforce: true
        },
        routing: {
          test: /[\\/]node_modules[\\/](@remix-run|react-router|react-router-dom)[\\/]/,
          name: 'routing',
          chunks: 'async',
          priority: 30
        },
        chart: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
          name: 'chart',
          chunks: 'async',
          priority: 25,
          enforce: true,
          minSize: 1000,
          maxSize: 10000
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
          minSize: 3000,
          maxSize: 10000
        }
      }
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8
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
            unused: true
          },
          mangle: {
            safari10: true,
            toplevel: true
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        extractComments: false
      })
    ]
  };
  
  return config;
};
