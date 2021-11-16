import { SFCDescriptor } from 'san-sfc-compiler';

import { Options } from '..';
import { attrsToQuery } from '../utils';

function genCSSModulesCode(
  index: number,
  request: string,
  esm: boolean
): string {
  const styleVar = `style${index}`;
  let code = esm
    ? `\nimport ${JSON.stringify(request)};` +
      `\nimport ${styleVar} from ${JSON.stringify(request + '.js')};`
    : `\nrequire(${JSON.stringify(request)});` +
      `\nvar ${styleVar} = require(${JSON.stringify(request + '.js')});`;
  code += `\n$style = Object.assign($style, ${styleVar});`;
  return code;
}

export default (
  descriptor: SFCDescriptor,
  scopeId: string,
  options: Options
) => {
  let stylesCode = `var $style = {};`;
  // 全局开关
  let hasCSSModules = false;
  if (descriptor.styles.length) {
    descriptor.styles.forEach((style, i) => {
      const src = style.src || descriptor.filename;
      const attrsQuery = attrsToQuery(
        style.attrs,
        'css',
        !!options.styleCompileOptions?.preprocessLang
      );
      const idQuery = `&id=${scopeId}`;
      const srcQuery = style.src ? `&src` : ``;
      const query = `?san&type=style&index=${i}${srcQuery}${idQuery}`;
      const styleRequest = src + query + attrsQuery;
      if (style.module) {
        if (!hasCSSModules) hasCSSModules = true;
        stylesCode += genCSSModulesCode(i, styleRequest, options.esModule!);
      } else {
        stylesCode += options.esModule
          ? `\nimport ${JSON.stringify(styleRequest)};`
          : `\nrequire(${JSON.stringify(styleRequest)});`;
      }
    });
  }
  return stylesCode;
};
