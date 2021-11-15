import { compileStyle } from 'san-sfc-compiler';
import { Options } from '..';
import { Query, normalizeSourceMap } from '../utils';

export default (
  code: string,
  request: string,
  filename: string,
  options: Options,
  query: Query
) => {
  const result = compileStyle({
    source: code,
    filename: query.filename!,
    id: `data-s-${query.id}`,
    scoped: !!query.scoped as any,
    modules: !!query.module as any,
    preprocessLang: query.lang,
    ...options.styleCompileOptions,
  });

  const ifCSSHashMap = ['css', 'less', 'sass', 'scss', 'styl']
    .map((ext) => `${ext}.js`) // 这里和 rollup-plugin-san 不太一样，后面计划改成全一样的然后再封装
    .some((lang) => query.lang === lang);

  if (ifCSSHashMap) {
    return {
      code: `export default ${JSON.stringify(result.cssHashMap)}`,
      map: null,
    };
  } else {
    return {
      code: result.code,
      map: normalizeSourceMap(result.map!, request, filename),
    };
  }
};
