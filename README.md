# psg-theme-multi

> Multi page styleguide theme for [postcss-style-guide](https://github.com/morishitter/postcss-style-guide)

Allows multiple page templates and isolated example snippets in iframes

## Install

```shell
$ npm install postcss-style-guide psg-theme-multi --save-dev
```

## Example

Node.js:

```js
var fs = require('fs');
var postcss = require('postcss');
var styleguide = require('postcss-style-guide');
var templateCfg = require('psg-theme-multi').config;
var iframeRenderer = require('psg-theme-multi/lib/renderer');
var input = fs.readFileSync('input.css', 'utf8');

const config = templateCfg({
	basePath: 'styleguide'
})({
	//postcss-style-guide options
	project: 'My Styleguide'
});

var output = postcss([
  iframeRenderer, // renders an isolated html file for each snippet. Accepts ejs templates 
  styleguide(config)
]).process(input)
```

In order to generate an isolated snippet file you have to provide a `@id <name>` annotation and enclose HTML content in 
a backticked code block. 

Example:

	/*
	@styleguide

	@id list
	@title List

	## renders an H2

	The following snippet will be rendered as `styleguide/_list.html`

	```html
	<ul class="list">
		<% for (i=0; i < 4; i++ ) { %>
		<li class="list__item">list item <%= i %><li>
		<% } %>
	</ul>
	```
	*/
	.list {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		cursor: pointer;
	}

	.button--large {
		width: 140px;
		height: 40px;
		font-size: 14px;
	}

	.button--red {
		color: #fff;
		background-color: var(--red);
	}

	.button--blue {
		color: #fff;
		background-color: var(--blue);
	}


## License

The MIT License (MIT)

Copyright (c) 2017 Marco Solazzi