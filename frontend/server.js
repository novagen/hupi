var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackConfig = require('./webpack.config.js');

const app = express();
const port = 8010;

const middleware = webpackMiddleware(webpack(webpackConfig), {
	publicPath: webpackConfig.output.publicPath
});

app.use(middleware);

app.listen(port, '0.0.0.0', function onStart(err) {
	if (err) {
		console.error(err);
	}

	console.info('Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
