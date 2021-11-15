import webpack from 'webpack';

let SanLoaderPlugin = null;

if (webpack.version && +webpack.version[0] > 4) {
  // webpack5 and upper
  SanLoaderPlugin = require('./plugin-webpack5').default;
} else {
  // webpack4 and lower
  SanLoaderPlugin = require('./plugin-webpack4').default;
}

export default SanLoaderPlugin;
