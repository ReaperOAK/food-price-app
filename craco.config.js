const CracoEsbuildPlugin = require('craco-esbuild');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        esbuildLoaderOptions: {
          loader: 'jsx',
          target: 'es2015',
        },
        esbuildMinimizerOptions: {
          target: 'es2015',
          css: true,
        },
      },
    },
  ],
  webpack: {
    plugins: {
      add: [
        new CompressionPlugin({
          test: /\.(js|css|html|svg)$/,
          algorithm: 'gzip',
        }),
      ],
    },
    configure: (webpackConfig) => {
      // Split chunks optimization
      webpackConfig.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 50000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
      return webpackConfig;
    },
  },
};
