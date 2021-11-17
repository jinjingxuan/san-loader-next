module.exports = function (options) {
  const context = Object.assign(
    { callback, runLoader, resourceQuery: '?' },
    options
  );
  return context;

  function runLoader(loader, source) {
    loader.call(context, source);
    return context;
  }

  function callback(error, code, sourceMap) {
    context.error = error;
    context.code = code;
    context.resourceMap = sourceMap;
  }
};
