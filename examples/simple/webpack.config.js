// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { SanLoaderPlugin } = require("../../dist/index");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  externals: {
    san: 'san', // 这里拆一下，把 san 挂载到 window 上，用 cdn 加载
  },
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
    new SanLoaderPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.san$/,
        use: [{ loader: path.join(__dirname, '../../dist/index.js') }]
      },
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  }
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
