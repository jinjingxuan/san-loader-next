import qs from 'qs';
import path from 'path';

import hash from 'hash-sum';
import { getOptions, stringifyRequest } from 'loader-utils';
import { parseSFC } from 'san-sfc-compiler';

import { Options } from './';
import generateTemplateImport from './gencode/template';
import generateStyleImport from './gencode/style';
import generateScriptImport from './gencode/script';
import transformTemplate from './transform/template';
import transformStyle from './transform/style';
import { getDescriptor, setDescriptor } from './utils';

// 默认配置
const defaultOptions: Options = {
  esModule: true,
  compileANode: false,
};

export default function (source) {
  // 获取用户在 webpack.config 中的配置
  const userOptions = getOptions(this);
  const options: Options = { ...defaultOptions, ...userOptions };

  // san 文件绝对路径: /Users/san-loader-next/examples/simple-webpack4/src/App.san
  const filename = this.resourcePath;
  // san 文件上一层路径：/Users/san-loader-next/examples/simple-webpack4/src
  const sourceRoot = this.context || process.cwd();
  
  /**
   * rawQuery:
   * 
   * san&type=script&id=472cf1bd&lang=js
   * san&type=template&id=472cf1bd&compileANode=aPack&lang=html
   * san&type=style&index=0&id=472cf1bd&module=true&lang=css
   * san&type=style&index=1&id=472cf1bd&lang=css
   */

  const rawQuery = this.resourceQuery.slice(1);

  // 解析 query 为对象
  const query = qs.parse(rawQuery);

  if (query && 'san' in query) {
    const descriptor = getDescriptor(filename);
    let result = { code: '', map: {} };

    if (query.type === 'template') {
      const hasScoped = descriptor!.styles.some((s) => s.scoped);
      result = transformTemplate(
        descriptor?.template!,
        rawQuery,
        filename,
        options,
        query,
        hasScoped
      );
    } else if (query.type === 'style') {
      result = transformStyle(
        descriptor?.styles!,
        rawQuery,
        filename,
        options,
        query
      );
    } else {
      result = {
        code: descriptor?.script!.content!,
        map: descriptor?.script?.map,
      };
    }
    console.log('result', result)
    if (this.sourceMap) {
      this.callback(null, result.code, result.map);
    } else {
      this.callback(null, result.code);
    }
  } else {
    const shortFilePath = path
      .relative(sourceRoot, filename)
      .replace(/^(\.\.[\/\\])+/, '')
      .replace(/\\/g, '/');
    const scopeId = hash(shortFilePath);

    const descriptor = parseSFC({
      source,
      filename,
      sourceRoot,
      needMap: true,
    });

    setDescriptor(filename, descriptor);

    // 生成入口文件
    const templateImport = generateTemplateImport(descriptor, scopeId, options);
    const stylesImport = generateStyleImport(descriptor, scopeId, options);
    const scriptImport = generateScriptImport(descriptor, scopeId, options);

    // normalize.js 的绝对路径
    const normalizePath = stringifyRequest(
      this,
      require.resolve('./normalize.js')
    );

    const importStr = options.esModule
      ? `import normalize from ${normalizePath};`
      : `var normalize = require(${normalizePath});`;
    const exportStr = options.esModule
      ? 'export default normalize(script, template, $style);'
      : 'module.exports.default = normalize(script, template, $style);';

    const output = [
      importStr,
      scriptImport,
      templateImport,
      stylesImport,
      exportStr,
      '/* san-hmr component */',
    ];

    this.callback(null, output.join('\n'));
  }
}
