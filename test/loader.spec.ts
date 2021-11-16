import { runLoaders } from 'loader-runner';

runLoaders(
  {
    resource:
      '/Users/wangjinghao/Desktop/Work/san-loader-next/examples/simple-webpack4/src/App.san',
    // String: Absolute path to the resource (optionally including query string)

    loaders: [
      '/Users/wangjinghao/Desktop/Work/san-loader-next/dist/index.js',
      'html-loader',
    ],
    // String[]: Absolute paths to the loaders (optionally including query string)
    // {loader, options}[]: Absolute paths to the loaders with options object

    context: { minimize: true },
    // Additional loader context which is used as base context

    // processResource: (loaderContext, resourcePath, callback) => {

    // },
    // Optional: A function to process the resource
    // Must have signature function(context, path, function(err, buffer))
    // By default readResource is used and the resource is added a fileDependency

    // Optional: A function to read the resource
    // Only used when 'processResource' is not provided
    // Must have signature function(path, function(err, buffer))
    // By default fs.readFile is used
  },
  function (err, result) {
    console.log(err, result.result);

    // err: Error?
    // result.result: Buffer | String
    // The result
    // only available when no error occured
    // result.resourceBuffer: Buffer
    // The raw resource as Buffer (useful for SourceMaps)
    // only available when no error occured
    // result.cacheable: Bool
    // Is the result cacheable or do it require reexecution?
    // result.fileDependencies: String[]
    // An array of paths (existing files) on which the result depends on
    // result.missingDependencies: String[]
    // An array of paths (not existing files) on which the result depends on
    // result.contextDependencies: String[]
    // An array of paths (directories) on which the result depends on
  }
);
