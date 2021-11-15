import qs from 'qs';
import RuleSet from 'webpack/lib/RuleSet.js';

const id = 'san-loader-plugin';
const NS = 'san-loader';

class SanLoaderPlugin {
  static NS?: string;
  apply(compiler) {
    compiler.hooks.compilation.tap(id, (compilation) => {
      const normalModuleLoader = compilation.hooks.normalModuleLoader;
      normalModuleLoader.tap(id, (loaderContext) => {
        loaderContext[NS] = true;
      });
    });

    const rawRules = compiler.options.module.rules;
    const { rules } = new RuleSet(rawRules);

    let sanRuleIndex = rawRules.findIndex(createMatcher('foo.san'));
    if (sanRuleIndex < 0) {
      sanRuleIndex = rawRules.findIndex(createMatcher('foo.san.html'));
    }

    const sanRule = rules[sanRuleIndex];
    const clonedRules = rules.filter((r) => r !== sanRule).map(cloneRule);

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

SanLoaderPlugin.NS = NS;

export default SanLoaderPlugin;
