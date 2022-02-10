/**
 * san-loader-next 使用 san-sfc-compiler 来解析 san 文件
 *
 * TemplateCompileOptions: san-sfc-compiler 编译模板代码可传参数。
 * https://github.com/wanwu/san-sfc-compiler/#compiletemplate
 *
 * StyleCompileOptions: san-sfc-compiler 编译样式代码可传参数。
 * https://github.com/wanwu/san-sfc-compiler/#compilestyle--compilestyleasync
 *
 */
import { TemplateCompileOptions, StyleCompileOptions } from 'san-sfc-compiler';

// 加载 san-loader 和 san-loader-plugin
// SanLoaderPlugin 的处理流程中，修改了 module.rules，在原来的规则基础上加入了 cloneRules 。新增的 rule ，能让 san 文件中的代码块匹配到对应的 rule。
import SanLoader from './loader';
import SanLoaderPlugin from './plugin';

// 配置项: https://github.com/jinjingxuan/san-loader-next/tree/analysis#%E9%85%8D%E7%BD%AE
interface Options {
  esModule?: boolean; // san-loader-next 默认使用 ESM 模块语法来生成 JS 模块，将该参数设为 false 可以改用 CommonJS 模块语法
  compileANode?: boolean; // 将组件的 template 编译成 aPack 或 aNode
  templateCompileOptions?: TemplateCompileOptions; // 编译 template 参数
  styleCompileOptions?: StyleCompileOptions; // 编译 style 参数
}

// 将 san-loader 、 san-loader-plugin 、 options 导出
export { SanLoaderPlugin, Options };

export default SanLoader;
