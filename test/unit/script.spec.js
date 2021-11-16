const loader = require('../../dist/index.js').default;
const webpackContext = require('./webpack-context.stub');

describe('.san 文件的产出', () => {
  test('导入 <script> 部分', () => {
    const source = '<script>console.log(1)</script>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('import script from "/foo.san?san&type=script&');
  });

  test('导入 <script lang="ts"> 部分', () => {
    const source = '<script lang="ts">console.log(1)</script>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('lang=ts');
    expect(ctx.code).toContain('import script from "/foo.san?san&type=script&');
  });
});
