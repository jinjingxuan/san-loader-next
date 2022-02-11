// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { SanLoaderPlugin } = require('san-loader-next');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    san: 'san', // 这里拆一下，把 san 挂载到 window 上，用 cdn 加载
  },
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new SanLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.san$/,
        use: [{ loader: 'san-loader-next'}],
      },
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        oneOf: [
          // 这里匹配 `<style module>`
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]_[hash:base64:5]',
                  },
                  localsConvention: 'camelCase',
                  sourceMap: true,
                },
              },
            ],
          },
          // 这里匹配 `<style>`
          {
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.html$/i,
        use: ['html-loader'],
      },
    ],
  },
  // for jest
  resolveLoader: {
    modules: [path.resolve(__dirname, 'node_modules')],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
