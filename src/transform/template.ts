import { compileTemplate } from 'san-sfc-compiler';
import { Options } from '..';
import { Query, normalizeSourceMap } from '../utils';

export default (
  code: string,
  request: string,
  filename: string,
  options: Options,
  query: Query,
  scoped?: boolean
) => {
  const result = compileTemplate({
    source: code,
    filename: query.filename!,
    id: `data-s-${query.id}`,
    scoped,
    compileANode: options.compileANode || (query.compileANode as any),
    ...options.templateCompileOptions,
  });

  return {
    code: result.code,
    map: normalizeSourceMap(result.map!, request, filename),
  };
};
