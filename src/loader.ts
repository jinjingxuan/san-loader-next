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

const defaultOptions: Options = {
  esModule: false,
  compileANode: false,
};

export default function (source) {
  const userOptions = getOptions(this);
  const options: Options = { ...defaultOptions, ...userOptions };

  const filename = this.resourcePath;
  const sourceRoot = this.context;
  const rawQuery = this.resourceQuery.slice(1);
  const query = qs.parse(rawQuery);

  if (query && 'san' in query) {
    const descriptor = getDescriptor(filename);
    let result = { code: '', map: {} };

    if (query.type === 'template') {
      const hasScoped = descriptor!.styles.some((s) => s.scoped);
      result = transformTemplate(
        descriptor?.template?.content!,
        rawQuery,
        filename,
        options,
        query,
        hasScoped
      );
    } else if (query.type === 'style') {
      result = transformStyle(
        descriptor?.styles[query.index as string].content!,
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
    const templateImport = generateTemplateImport(descriptor, scopeId);
    const stylesImport = generateStyleImport(
      descriptor,
      scopeId,
      !!options.styleCompileOptions?.preprocessLang
    );
    const scriptImport = generateScriptImport(descriptor, scopeId);

    const runtimeCodePath = stringifyRequest(
      this,
      require.resolve('./runtime.js')
    );

    const output = [
      `import $runtime from ${runtimeCodePath};`,
      scriptImport,
      templateImport,
      stylesImport,
      'export default $runtime(script, template, $style);',
      '/* san-hmr component */',
    ];

    this.callback(null, output.join('\n'));
  }
}
