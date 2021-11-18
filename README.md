# san-loader-next

`san-loader-next` 是一个 webpack loader，允许开发者以书写 `.san` 单文件组件（SFC）的方式来进行组件开发。如下：

```html
<template>
  <div class="content">Hello {{name}}!</div>
</template>

<script>
  export default {
    initData() {
      return {
        name: 'San.js',
      };
    },
  };
</script>

<style>
  .content {
    color: blue;
  }
</style>
```

San 单文件在写法上与 Vue 类似，san-loader-next 会将 `template`、`script`、`style` 等标签块当中的内容和属性提取出来，并交给 webpack 分别进行处理。最终单文件对外返回的将是一个普通的 San 组件类，我们可以直接使用它进行 San 组件的各种操作：

```js
import App from './App.san';
let app = new App();
app.attach(document.body);
```

## 功能

类似 vue-loader，本插件支持很多有用的功能：

- scoped css

- css modules （需要 style-loader、css-loader）

- template 编译 aNode / aPack [文档](https://github.com/baidu/san/blob/master/doc/anode.md)

- less 等 css 预处理器（需要自行安装配套包）

- pug 等 html 预处理器（需要自行安装配套包）

- typescript 等 js 方言（需要自行安装配套包）

等等。

## 使用

```shell
npm install --save-dev san-loader-next
```

### 基本配置

```js
const { SanLoaderPlugin } = require('san-loader-next');

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.san$/,
        loader: 'san-loader-next',
      },
      // ...
    ],
  },
  plugins: [new SanLoaderPlugin()],
};
```

### 复杂一些的配置

```js
const { SanLoaderPlugin } = require('san-loader-next');

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.san$/,
        loader: 'san-loader-next',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      // ...
    ],
  },
  plugins: [new SanLoaderPlugin()],
};
```

更加完整的 webpack 配置，可以参考[示例](https://github.com/wanwu/san-loader-next/blob/main/examples/)

## 配置

|          名称          |          可选值          |   默认   | 备注                                                                                               |
| :--------------------: | :----------------------: | :------: | :------------------------------------------------------------------------------------------------- |
|     `compileANode`     | `'none'/'aPack'/'aNode'` | `'none'` | 将组件的 `template` 编译成 `aPack` 或 `aNode`                                                      |
|       `esModule`       |      `true / false`      |  `true`  | san-loader-next 默认使用 ESM 模块语法来生成 JS 模块，将该参数设为 false 可以改用 CommonJS 模块语法 |
| templateCompileOptions | 详见 `san-sfc-compiler`  | `Object` | 透传 `san-sfc-compiler`                                                                            |
|  styleCompileOptions   | 详见 `san-sfc-compiler`  | `Object` | 透传 `san-sfc-compiler`                                                                            |

templateCompileOptions 和 styleCompileOptions 详见 [san-sfc-compiler](https://github.com/wanwu/san-sfc-compiler/)

## 说明

### 和 `san-loader` 相比

- 为了渐进式迁移，所以有不同的名字

- 打包结果和旧版一致（页面表现上）

### Webpack5 兼容

因为本插件兼容 webpack4 和 webpack5，同时安装了两个版本，所以使用 webpack5 可能会出现编译报错的情况。

下面提供一点排查思路：

- 确定相关 loader、plugin 是否适配了 webpack5

- 确定安装的版本的确是 webpack5，没有其他 node_modules 干扰

- 使用不同的包管理安装器，如 yarn、pnpm、cpnm、tnpm 等等

## 参考

- [vue-loader](https://github.com/vuejs/vue-loader)

- [旧版 san-loader](https://github.com/ecomfe/san-loader)

- [san-sfc-compiler](https://github.com/wanwu/san-sfc-compiler/)

- [aNode 结构设计](https://github.com/baidu/san/blob/master/doc/anode.md)

- [aPack: aNode 压缩结构设计](https://github.com/baidu/san/blob/master/doc/anode-pack.md)

## 协议

```txt
MIT License

Copyright (c) 2021 Baidu Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
