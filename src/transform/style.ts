import { compileStyle, SFCBlock } from 'san-sfc-compiler';
import { Options } from '..';
import { Query, normalizeSourceMap } from '../utils';

export default (
  styles: SFCBlock[],
  request: string,
  filename: string,
  options: Options,
  query: Query
) => {
  const style = styles[query.index as number];
  const result = compileStyle({
    source: style.content,
    filename: query.filename!,
    id: `data-s-${query.id}`,
    scoped: !!query.scoped as any,
    preprocessLang: query.lang,
    ...options.styleCompileOptions,
  });

  return {
    code: result.code,
    map: normalizeSourceMap(result.map!, request, filename),
  };
};
