const build = require('./webpack-build');

describe('simple', () => {
  let result;

  beforeAll(async () => {
    result = await build('simple');
  });

  it('🌟 should compile <template>', () => {
    // expect(result.output[0].code).toEqual(
    //   expect.stringContaining('var script = ')
    // );
    // expect(result.output[0].code).toEqual(
    //   expect.stringContaining(`name: 'San.js',`)
    // );
  });
});
