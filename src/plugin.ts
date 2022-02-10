/**
 * 根据 webpack 版本选择 SanLoaderPlugin
 */

import webpack from 'webpack';

let SanLoaderPlugin = null;

// plugin-webpack.ts 是使用 esm 语法导出的，所以这里加了 .default
if (webpack.version && +webpack.version[0] > 4) {
  // webpack5 and upper
  SanLoaderPlugin = require('./plugin-webpack5').default;
} else {
  // webpack4 and lower
  SanLoaderPlugin = require('./plugin-webpack4').default;
}

export default SanLoaderPlugin;
