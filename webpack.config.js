const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  devtool: false,
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
    hints: 'warning'
  },
  optimization: {
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
    splitChunks: {
      chunks: 'all',
      minSize: 15000,
      maxSize: 40000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '.',
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 40,
        },
        chart: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
          name: (module) => {
            const match = module.context.match(/[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/](.*?)[\\/]/);
            return match ? `chart.${match[2].replace('@', '')}` : 'chart.vendor';
          },
          chunks: 'async',
          priority: 30,
          enforceSizeThreshold: 50000
        },
        router: {
          test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
          name: 'router',
          chunks: 'async',
          priority: 20,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -20,
          reuseExistingChunk: true,
        },
        common: {
          minChunks: 2,
          priority: -30,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
  },
  plugins: [
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'gzip',
      threshold: 10240,
      minRatio: 0.8,
    }),
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      'path': false,
      'fs': false,
      'crypto': false,
    },
  },
};
