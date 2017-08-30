const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const annotation = require('css-annotation');
const mkdirp = require('mkdirp');
const ejs = require('ejs');

const render = (html, meta, filename) => {
    return ejs.render(html, meta, {
        cache: true,
        filename
    });
};

module.exports = postcss.plugin('comment-render', (opts) => {

    const options = Object.assign({
        dest: 'styleguide',
        render,
        styles: [],
        template: path.resolve(__dirname, '..', 'templates/snippet-template.ejs')
    }, opts || {});

    const dest = path.resolve(process.cwd(), options.dest);

    const template = ejs.compile(fs.readFileSync(options.template, 'utf8'));

    mkdirp.sync(dest);

    return (css) => {

        css.walkComments((comment) => {

            const text = comment.text;

            if (text.indexOf('@styleguide') === -1) {
                return;
            }

            if (comment.parent.type !== 'root') {
                return;
            }

            const meta = annotation.read(text);

            if (!meta.id) {
                return;
            }

            //render demo file...
            const rendered = text.replace(/```html([\s\S]+?)```/g, (match, snippet) => {
                const filename = path.join(dest, `_${meta.id}.html`);
                const html = options.render(snippet, meta, filename);

                fs.writeFile(filename, template({ meta, styles: options.styles, html }), (err) => {
                    if (err) {
                        console.error(`Error rendering '${filename}'`); //eslint-disable-line no-console
                    }
                });

                return html.replace(/<script>[\s\S]+?<\/script>/g, '');
            });

            comment.text = rendered; //eslint-disable-line

        });
    };

});