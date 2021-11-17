const build = require('../webpack-build');
const aNodeUtils = require('san-anode-utils');

describe('simple-webpack4', () => {
  let result;

  beforeAll(async () => {
    result = await build('simple-webpack4');
  });
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
  });

  it('🌟 should compile <template> with webpack4', () => {
    expect(result).toBeTruthy();
  });

  it('should compile aPack', () => {
    let aNode = aNodeUtils.parseTemplate(
      `<div class="{{$style.content}}">Hello {{name}}!</div>`
    );
    const aPack = aNodeUtils.pack(aNode.children[0]);
    expect(result).toBeTruthy();
    expect(result).toContain(JSON.stringify(aPack));
  });
});
