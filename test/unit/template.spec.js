const loader = require('../../dist/index.js').default;
const webpackContext = require('./webpack-context.stub');

describe('.san 文件的产出', () => {
  test('整体框架', () => {
    const source = `
            <template>
                <span class="{{$style.red}}">Author: harttle</span>
            </template>
            <style module>.red { color: red }</style>
            <script>
                export default class CompComponent extends Component {
                    attached() { console.log('attached') }
                }
            </script>
        `;
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('import $runtime from');
    expect(ctx.code).toContain('import template from');
    expect(ctx.code).toContain('import script from');
    expect(ctx.code).toContain('import style0 from');
    expect(ctx.code).toContain(
      'export default $runtime(script, template, $style);'
    );
  });

  test('导入 <template> 部分', () => {
    const source = '<template><span>Author: harttle</span></template>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain(
      'import template from "/foo.san?san&type=template'
    );
  });

  test('导入 <template lang="pug"> 部分', () => {
    const source =
      '<template lang="pug"><span>Author: harttle</span></template>';
    let ctx = webpackContext({ resourcePath: '/foo.san' }).runLoader(
      loader,
      source
    );
    expect(ctx.code).toContain('lang=pug');
    expect(ctx.code).toContain(
      'import template from "/foo.san?san&type=template'
    );
  });
});
