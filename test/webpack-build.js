const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const webpack5 = require('webpack5');

module.exports = function (name, version) {
  const builder = version === 5 ? webpack5 : webpack;

  const base = path.resolve(
    __dirname,
    '../examples/',
    name,
    'webpack.config.js'
  );
  const config = require(base)();
  config.entry = path.resolve(__dirname, path.dirname(base), config.entry);

  let file = '';
  return new Promise((resolve, reject) => {
    builder(config, (err, stats) => {
      if (err) reject(err);

      const output = stats.toJson().assetsByChunkName.main.toString();
      file = fs.readFileSync(path.join(config.output.path, output)).toString();
      resolve(file);
    });
  });
};
