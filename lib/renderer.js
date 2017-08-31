const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const annotation = require('css-annotation');
const mkdirp = require('mkdirp');
const ejs = require('ejs');

const render = (html, meta, filename) => ejs.render(html, meta, {
    cache: true,
    filename
});

const metaRegExp = /@(documents|document|doc|docs|styleguide)/;

module.exports = postcss.plugin('comment-render', (opts) => {

    const options = Object.assign({
        dest: 'styleguide/examples',
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

            if (metaRegExp.test(text) === false || comment.parent.type !== 'root') {
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

                return '```html\n' + html.replace(/<script>[\s\S]+?<\/script>/g, '') + '\n```'; //eslint-disable-line prefer-template
            });

            comment.text = rendered; //eslint-disable-line

        });
    };

});