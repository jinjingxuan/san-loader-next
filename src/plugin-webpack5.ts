import qs from 'qs';

const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin');
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin');
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler');
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin');

const ruleSetCompiler = new RuleSetCompiler([
  new BasicMatcherRulePlugin('test', 'resource'),
  new BasicMatcherRulePlugin('include', 'resource'),
  new BasicMatcherRulePlugin('exclude', 'resource', true),
  new BasicMatcherRulePlugin('resource'),
  new BasicMatcherRulePlugin('conditions'),
  new BasicMatcherRulePlugin('resourceQuery'),
  new BasicMatcherRulePlugin('realResource'),
  new BasicMatcherRulePlugin('issuer'),
  new BasicMatcherRulePlugin('compiler'),
  new BasicEffectRulePlugin('type'),
  new BasicEffectRulePlugin('sideEffects'),
  new BasicEffectRulePlugin('parser'),
  new BasicEffectRulePlugin('resolve'),
  new BasicEffectRulePlugin('generator'),
  new UseEffectRulePlugin(),
]);

const id = 'san-loader-plugin';
const NS = 'san-loader';

class SanLoaderPlugin {
  static NS?: string;
  apply(compiler) {
    const normalModule = compiler.webpack
      ? compiler.webpack.NormalModule
      : require('webpack/lib/NormalModule');

    compiler.hooks.compilation.tap(id, (compilation) => {
      const normalModuleLoader =
        normalModule.getCompilationHooks(compilation).loader;

      normalModuleLoader.tap(id, (loaderContext) => {
        loaderContext[NS] = true;
      });
    });

    const rules = compiler.options.module.rules;
    let rawSanRules;
    let sanRules = [];

    for (const rawRule of rules) {
      const clonedRawRule = Object.assign({}, rawRule);
      delete clonedRawRule.include;

      const ruleSet = ruleSetCompiler.compile([
        {
          rules: [clonedRawRule],
        },
      ]);
      sanRules = ruleSet.exec({
        resource: 'foo.san',
      });

      if (!sanRules.length) {
        sanRules = ruleSet.exec({
          resource: 'foo.san.html',
        });
      }
      if (sanRules.length > 0) {
        if (rawRule.oneOf) {
          throw new Error(
            '[SanLoaderPlugin Error] san-loader currently does not support san rules with oneOf.'
          );
        }
        rawSanRules = rawRule;
        break;
      }
    }
    if (!sanRules.length) {
      throw new Error(
        '[SanLoaderPlugin Error] No matching rule for .san files found.\n' +
          'Make sure there is at least one root-level rule that matches .san or .san.html files.'
      );
    }

    // for each user rule (expect the san rule), create a cloned rule
    // that targets the corresponding language blocks in *.san files.
    const refs = new Map();
    const clonedRules = rules
      .filter((r) => r !== rawSanRules)
      .map((rawRule) => cloneRule(rawRule, refs));

    // replace original rules
    compiler.options.module.rules = [
      // pitcher,
      ...clonedRules,
      ...rules,
    ];
  }
}

function cloneRule(rawRule, refs) {
  const rules = ruleSetCompiler.compileRules(
    'ruleSet',
    [
      {
        rules: [rawRule],
      },
    ],
    refs
  );
  let currentResource;

  const conditions = rules[0].rules
    .map((rule) => rule.conditions)
    // shallow flat
    .reduce((prev, next) => prev.concat(next), []);

  // do not process rule with enforce
  if (!rawRule.enforce) {
    const ruleUse = rules[0].rules
      .map((rule) =>
        rule.effects
          .filter((effect) => effect.type === 'use')
          .map((effect) => effect.value)
      )
      // shallow flat
      .reduce((prev, next) => prev.concat(next), []);

    // fix conflict with config.loader and config.options when using config.use
    delete rawRule.loader;
    delete rawRule.options;
    rawRule.use = ruleUse;
  }

  const res = Object.assign({}, rawRule, {
    resource: (resources) => {
      currentResource = resources;
      return true;
    },
    resourceQuery: (query) => {
      const parsed = qs.parse(query.slice(1));
      if (parsed.san == null) {
        return false;
      }
      if (!conditions) {
        return false;
      }
      const fakeResourcePath = `${currentResource}.${parsed.lang}`;
      for (const condition of conditions) {
        // add support for resourceQuery
        const request =
          condition.property === 'resourceQuery' ? query : fakeResourcePath;
        if (condition && !condition.fn(request)) {
          return false;
        }
      }
      return true;
    },
  });

  delete res.test;

  if (rawRule.rules) {
    res.rules = rawRule.rules.map((rule) => cloneRule(rule, refs));
  }

  if (rawRule.oneOf) {
    res.oneOf = rawRule.oneOf.map((rule) => cloneRule(rule, refs));
  }

  return res;
}

SanLoaderPlugin.NS = NS;

export default SanLoaderPlugin;
