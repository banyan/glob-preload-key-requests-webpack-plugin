# Glob Preload Key Requests Webpack Plugin

```js
const GlobPreloadKeyRequestsPlugin = require('glob-preload-key-requests-webpack-plugin');

module.exports = {
  // entry: ...
  // module: ...
  plugins: [
    new GlobPreloadKeyRequestsPlugin({
      base: path.resolve(__dirname, 'build'),
      src: 'index.html',
      dest: 'index.html',
      inlineCSS: true, // => default false
      cssGlobPatterns: ['login'],
      jsGlobPatterns: ['login'],
    }),
  ]
}
```

## License

MIT
