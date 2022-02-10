import qs from 'qs';
const RuleSet = require('webpack/lib/RuleSet');

const id = 'san-loader-plugin';
const NS = 'san-loader';

// SanLoaderPlugin 导出的是一个类
class SanLoaderPlugin {
  static NS?: string;
  apply(compiler) {

    // 在 normalModuleLoader 钩子执行前调用代码：loaderContext[NS] = true
    compiler.hooks.compilation.tap(id, (compilation) => {
      const normalModuleLoader = compilation.hooks.normalModuleLoader;
      normalModuleLoader.tap(id, (loaderContext) => {
        loaderContext[NS] = true;
      });
    });

    // 获取原始配置的规则
    const rawRules = compiler.options.module.rules;
    const { rules } = new RuleSet(rawRules);

    // cloneRules 的职责是将你定义过的其它规则复制并应用到 .san 文件里相应语言的块。
    // 例如，如果你有一条匹配 /\.js$/ 的规则，那么它会应用到 .san 文件里的 <script> 块。

    // 首先找到 san 文件应用 san-loader 的规则，cloneRules 中不包括这一条
    let sanRuleIndex = rawRules.findIndex(createMatcher('foo.san'));
    if (sanRuleIndex < 0) {
      sanRuleIndex = rawRules.findIndex(createMatcher('foo.san.html'));
    }

    // 生成 clonedRules
    const sanRule = rules[sanRuleIndex];
    const clonedRules = rules.filter((r) => r !== sanRule).map(cloneRule);

    // 更改 rules
    compiler.options.module.rules = [...clonedRules, ...rules];
  }
}

function createMatcher(fakeFile) {
  return (rule) => {
    const clone = Object.assign({}, rule);
    delete clone.include;
    const normalized = RuleSet.normalizeRule(clone, {}, '');
    return (
      !rule.enforce && normalized.resource && normalized.resource(fakeFile)
    );
  };
}

/**
 *  resource: 被处理资源的绝对路径
 *  resourceQuery: 被处理资源的绝对路径中？后面的部分
 */

function cloneRule(rule) {
  const { resource, resourceQuery } = rule;
  let currentResource;
  const res = Object.assign({}, rule, {
    resource: {
      test: (resource) => {
        currentResource = resource;
        return true;
      },
    },
    resourceQuery: (query) => {
      // 首先，经过san-loader拆分之后的style、template、script会变成：
      // xxx.san?san=&lang=js&type=script
      // lang=js/css/less/html...，来自element的lang attribute
      const parsed = qs.parse(query.slice(1));
      // 跳过不是san=的，即不是san-loader拆分的文件
      if (parsed.san == null) {
        return false;
      }
      // 跳过san-loader拆分后，没有lang的，lang=js/css/less/html...
      if (resource && parsed.lang == null) {
        return false;
      }
      // 得到一个假的uri，用于判断之前的rule是否匹配
      const fakeResourcePath = `${currentResource}.${parsed.lang}`;
      // 复制之前的loader rule，规则匹配不上的，例如babel的test/\.js$/，如果匹配不上，则跳过
      // js文件，则xxx.js，resource(xxx.js) => true => false，则继续
      if (resource && !resource(fakeResourcePath)) {
        return false;
      }
      // 同上，匹配的是babel写了resourceQuery的情况
      if (resourceQuery && !resourceQuery(query)) {
        return false;
      }
      if (parsed.type === 'style' && parsed.module !== undefined) {
        const conf = findMatchedLoader(
          'css-loader',
          rule,
          currentResource,
          resourceQuery
        );
        // style 会经过很多规则，检查 css-loader 的那一个
        if (conf && (!conf.options || !conf.options.modules)) {
          throw new Error(
            `css-loader#module not set, required by ${currentResource}${query}`
          );
        }
      }
      // 经过过滤，则这个babel的rule，必须是query: san=&lang=js 才会过
      // 同时跟babel的rule必须resource/resourceQuery是匹配上的
      // 这样可以避免给san-loader处理后的文件单独配置后续loader
      // 实现共享项目的loader rule
      return true;
    },
  });

  if (rule.rules) {
    res.rules = rule.rules.map(cloneRule);
  }

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map(cloneRule);
  }

  return res;
}

/**
 * 找到 oneOf 或 use 中匹配的指定 loader
 *
 * @argument loaderName 要找的 loader 名
 * @argument rule 当前匹配到的大规则，里面可能有 use 或 oneOf
 * @argument resource 当前 resource
 * @argument query 当前 resourceQuery
 * @return 对应 loader 的配置，如果没有匹配返回 undefined
 */
function findMatchedLoader(loaderName, rule, resource?, query?) {
  if (rule.use) {
    for (let conf of rule.use) {
      if (conf.loader === loaderName) {
        return conf;
      }
    }
  }
  if (rule.oneOf) {
    for (let subRule of rule.oneOf) {
      if (
        (subRule.resource && subRule.resource(resource)) ||
        (subRule.resourceQuery && subRule.resourceQuery(query))
      ) {
        return findMatchedLoader(loaderName, subRule);
      }
    }
  }
}

SanLoaderPlugin.NS = NS;

export default SanLoaderPlugin;
