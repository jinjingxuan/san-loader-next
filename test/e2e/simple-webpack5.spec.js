const build = require('../webpack-build');

describe('simple-webpack5', () => {
  let result;

  beforeAll(async () => {
    result = await build('simple-webpack5', 5);
  });
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
  });

  it('🌟 should compile <template> with webpack5', () => {
    expect(result).toBeTruthy();
  });
});
