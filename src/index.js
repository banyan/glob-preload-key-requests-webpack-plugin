const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'GlobPreloadKeyRequestsPlugin';

const defaultOptions = {
  cssGlobPatterns: [],
  dest: 'index.html',
  inlineCSS: false,
  jsGlobPatterns: [],
  src: 'index.html',
};

class GlobPreloadKeyRequestsPlugin {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }

  emit(compilation, callback) {
    const {
      base,
      cssGlobPatterns,
      dest,
      inlineCSS,
      jsGlobPatterns,
      src,
    } = this.options;

    console.log('this.options: ', this.options);
    console.log('dest: ', dest);

    const cssRegex = new RegExp(cssGlobPatterns.join('|'));
    const jsRegex = new RegExp(jsGlobPatterns.join('|'));

    const css = Object.keys(compilation.assets)
      .filter((filename) => /\.css$/.test(filename))
      .filter((filename) => cssRegex.test(filename))
      .map((filename) => filename);

    const js = Object.keys(compilation.assets)
      .filter((filename) => /\.js$/.test(filename))
      .filter((filename) => jsRegex.test(filename))
      .map((filename) => filename);

    const input = path.join(base, src);
    const output = path.join(base, dest);

    fs.readFile(input, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }

      let filesToInclude = '';

      if (inlineCSS) {
        const inlineCSSData = css.map((link) => fs.readFileSync(path.join(base, link), 'utf8')).join('');
        filesToInclude = data.replace(/<\/style>/g, `${inlineCSSData}<\/style>`);
      } else {
        const cssLinks = css.map((link) => `<link href="/${link}" rel="preload" as="style" onload="this.rel='stylesheet'" />`).join('');
        filesToInclude = data.replace(/<\/head>/g, `${cssLinks}<\/head>`);
      }

      const jsLinks = js.map((link) => `<link href="/${link}" rel="preload" as="script" />`).join('');
      filesToInclude = filesToInclude.replace(/<\/head>/g, `${jsLinks}<\/head>`);

      fs.writeFile(output, filesToInclude, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });

    callback();
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      this.emit(compilation, callback);
    });
  }
}

module.exports = GlobPreloadKeyRequestsPlugin;
