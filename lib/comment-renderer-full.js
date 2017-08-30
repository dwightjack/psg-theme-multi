const postcss = require('postcss');
const fs = require('fs');
const annotation = require('css-annotation');
const mkdirp = require('mkdirp');

const paths = require('../../gulp-config/paths');
const viewHelpers = require('./view-helpers');

const fixturesPath = paths.toAbsPath('src.fixtures');
const styleguideDest = paths.toAbsPath('dist.root/styleguide/examples');

module.exports.commentRender = postcss.plugin('comment-render', ({ viewPath, options }) => {

    const env = viewHelpers.nunjucks([viewPath], options);

    mkdirp.sync(styleguideDest);

    return (css) => {

        const data = viewHelpers.readFixtures(fixturesPath);

        css.walkComments((comment) => {

            if (/[=]{3,}/.test(comment.text)) {
                comment.text = comment.text.replace(/[=]{3,}/g, ''); //eslint-disable-line
            }

            if (comment.text.indexOf('@styleguide') === -1) {
                return;
            }

            if (comment.parent.type !== 'root') {
                return;
            }

            const meta = annotation.read(comment.text);



            //render demo file...
            const matches = comment.text.match(/```html([\s\S]+?)```/g);

            if (matches && meta.id) {
                matches.forEach((match) => {
                    const html = env.renderString(`
                        {% extends "styleguide/_demo.html" %}
                        {% block main %}
                            ${match.replace('```html', '').replace('```', '')}
                        {% endblock %}
                    `, Object.assign({}, { meta }, data || {}));

                    fs.writeFile(`${styleguideDest}/_${meta.id}.html`, html, (err) => {
                        if (err) {
                            console.error(`Error rendering '${styleguideDest}/_${meta.id}.html'`);
                        }
                    });
                });
            }

            const rendered = env.renderString(
                comment.text,
                Object.assign({}, data || {})
            ).replace(/<script>[\s\S]+?<\/script>/g, '').replace(/```html\s+/g, '```html\n\t');

            comment.text = rendered; //eslint-disable-line

        });
    };

});