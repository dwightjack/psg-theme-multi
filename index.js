const path = require('path');
const Prism = require('prismjs');
const marked = require('marked');
const execute = require('postcss-style-guide/lib/syntaxHighlight').execute;

const syntaxHighlighter = {
    highlight: (css) => Prism.highlight(css, Prism.languages.css),
    execute(params) {
        return execute(Object.assign(params, {
            stylePath: require.resolve('prismjs/themes/prism.css')
        }));
    }
};

module.exports.syntaxHighlighter = syntaxHighlighter;

module.exports.config = (options) => (cfg) => {

    const o = Object.assign({
        basePath: 'styleguide'
    }, options || {});

    const basePath = path.resolve(process.cwd(), o.basePath);

    marked.setOptions({
        highlight(code) {
            return Prism.highlight(code, Prism.languages.markup);
        }
    });

    return Object.assign({
        project: 'Styleguide',
        dest(opts, pluginOpts) {
            const defaultPath = path.join(basePath, 'index.html');
            if (pluginOpts.from) {
                const filename = path.basename(pluginOpts.from, '.css');
                if (filename === 'application') {
                    return defaultPath;
                }
                return path.join(basePath, `${filename}.html`);
            }
            return defaultPath;
        },
        markdownParser(md) {
            return marked(md).trim();
        },
        syntaxHighlighter,
        showCode: true,
        themePath: __dirname
    }, cfg || {});
};