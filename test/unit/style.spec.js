const loader = require('../../dist/index.js').default;
const webpackContext = require('./webpack-context.stub');

describe('.san 文件的产出', () => {
  test('导入 <style> 部分', () => {
    const source = '<style>p {color: black}</style>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('lang=css');
  });

  test('导入 <style module>', () => {
    const source = '<style module>p {color: black}</style>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('module=true');
    expect(ctx.code).toContain(
      'import style0 from "/foo.san?san&type=style&index=0'
    );
  });

  test('导入 <style module src="./s.less">', () => {
    const source = '<style module src="./s.less"></style>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('module=true');
    expect(ctx.code).toContain(
      'import style0 from "./s.less?san&type=style&index=0&src'
    );
  });
});
