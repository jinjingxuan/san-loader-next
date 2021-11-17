const build = require('../webpack-build');

describe('complex', () => {
  let result;

  beforeAll(async () => {
    result = await build('complex');
  });
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
  });

  it('🌟 should compile <template> with webpack4', () => {
    expect(result).toBeTruthy();
  });
});
