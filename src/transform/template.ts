import { compileTemplate, SFCBlock } from 'san-sfc-compiler';
import { Options } from '..';
import { Query, normalizeSourceMap } from '../utils';

export default (
  template: SFCBlock,
  request: string,
  filename: string,
  options: Options,
  query: Query,
  scoped?: boolean
) => {
  const result = compileTemplate({
    source: template.content,
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
