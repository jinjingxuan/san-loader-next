import { SFCDescriptor } from 'san-sfc-compiler';

import { Options } from '..';
import { attrsToQuery } from '../utils';

export default (
  descriptor: SFCDescriptor,
  scopeId: string,
  options: Options
) => {
  let stylesCode = `var $style = [];`;
  const $style: Array<string> = [];
  let styleRequest = '';

  if (descriptor.styles.length) {
    descriptor.styles.forEach((style, i) => {
      const src = style.src || descriptor.filename;
      const attrsQuery = attrsToQuery(style.attrs, 'css');
      const idQuery = `&id=${scopeId}`;
      const srcQuery = style.src ? `&src` : ``;
      const query = `?san&type=style&index=${i}${srcQuery}${idQuery}`;

      if (style.src) {
        styleRequest = style.src + '?module=true';
      } else {
        styleRequest = src + query + attrsQuery;
      }

      if (style.module) {
        const styleVar = `style${i}`;
        stylesCode += `\nimport ${styleVar} from ${JSON.stringify(styleRequest)};`;
        $style.push(styleVar);
      } else {
        stylesCode += `\nimport ${JSON.stringify(styleRequest)};`;
      }

      stylesCode += `$style = [${$style.join(', ')}];\n`;
    });
  }
  return stylesCode;
};
