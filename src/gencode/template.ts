import { SFCDescriptor } from 'san-sfc-compiler';

import { Options } from '..';
import { attrsToQuery } from '../utils';

export default (
  descriptor: SFCDescriptor,
  scopeId: string,
  options: Options
) => {
  const template = descriptor.template;
  let templateImport = `var template = '';`;

  if (template) {
    const src = template.src || descriptor.filename;
    const idQuery = `&id=${scopeId}`;
    const srcQuery = template.src ? `&src` : ``;
    const attrsQuery = attrsToQuery(template.attrs, 'html');
    const query = `?san&type=template${idQuery}${srcQuery}${attrsQuery}`;
    const templateRequest = JSON.stringify(src + query);
    templateImport = options.esModule
      ? `import template from ${templateRequest};\n`
      : `var template = require(${templateRequest});\n`;
  }

  return templateImport;
};
