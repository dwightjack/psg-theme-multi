const fs = require('fs');
const postcss = require('postcss');
const styleguide = require('postcss-style-guide');

const templateCfg = require('../index').config;
const iframeRenderer = require('../lib/renderer');

const input = fs.readFileSync(`${__dirname}/input.css`, 'utf8');

const config = templateCfg({
    basePath: 'demo/styleguide'
}, {
    project: 'My Styleguide'
});

postcss([
    iframeRenderer({
        dest: 'demo/styleguide/examples',
        styles: ['../../input.css']
    }), // renders an isolated html file for each snippet. Accepts ejs templates
    styleguide(config)
]).process(input).then((result) => {
    // console.log(result);
});