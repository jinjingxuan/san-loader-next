import path from 'path';
import { SFCBlock, SFCDescriptor } from 'san-sfc-compiler';

// file query
export type Query = Partial<
  SFCBlock & {
    filename: string;
    san?: false;
    index?: number;
    id?: string;
    compileANode?: string | undefined;
  }
>;

export function attrsToQuery(
  attrs: SFCBlock['attrs'],
  langFallback?: string,
  forceLangFallback = false
): string {
  let query = ``;
  for (const name in attrs) {
    const value = attrs[name];
    if (!['id', 'index', 'src', 'type', 'lang'].includes(name)) {
      query += `&${name}${value ? `=${String(value)}` : ``}`;
    }
  }
  if (langFallback || attrs.lang) {
    query +=
      `lang` in attrs
        ? forceLangFallback
          ? `&lang=${langFallback}` // 这里和 rollup-plugin-san 有点不一样，用的是 等号
          : `&lang=${attrs.lang}`
        : `&lang=${langFallback}`;
  }
  return query;
}

export interface RawSourceMap {
  file?: string;
  sourceRoot?: string;
  version: string;
  sources: string[];
  names: string[];
  sourcesContent?: string[];
  mappings: string;
}

export function normalizeSourceMap(
  map: RawSourceMap,
  request: string,
  filename: string
): any {
  if (!map) return null as any;

  if (!request.includes('type=script')) {
    map.file = path.basename(filename);
    map.sources = map.sources || [];
    map.sources[0] = filename;
  }

  return {
    ...map,
    version: Number(map.version) || 3,
    mappings: typeof map.mappings === 'string' ? map.mappings : '',
  };
}

// sfc descriptor
const cache = new Map<string, SFCDescriptor | null>();

export function setDescriptor(id: string, entry: SFCDescriptor | null) {
  cache.set(id, entry);
}

export function getDescriptor(id: string) {
  if (cache.has(id)) {
    return cache.get(id)!;
  }
  return null;
}

export const getPath = (src: string, filePath: string) => {
  const dir = path.dirname(filePath);
  const srcPath = path.resolve(dir, src);

  return srcPath;
};
