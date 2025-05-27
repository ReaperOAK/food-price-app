const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize splitting
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            babel: {
              test: /[\\/]node_modules[\\/](@babel)[\\/]/,
              name: 'babel',
              chunks: 'all',
              priority: 35,
              enforce: true,
            },
            router: {
              test: /[\\/]node_modules[\\/](@remix-run|react-router|react-router-dom)[\\/]/,
              name: 'router',
              chunks: 'all',
              priority: 30,
            },
            chartjs: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: 'chartjs',
              chunks: 'async',
              priority: 20,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: -10,
              reuseExistingChunk: true,
            },
            common: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Add compression plugin
      webpackConfig.plugins.push(
        new CompressionPlugin({
          test: /\.(js|css|html|svg)$/,
          algorithm: 'gzip',
        })
      );

      // Disable source maps in production
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = false;
      }

      return webpackConfig;
    },
  },
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
        },
      ],
    ],
  },
};
