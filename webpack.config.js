const path = require('path');

module.exports = {
	entry: {
		background: './service-worker.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'), // Replace with your desired output directory
		filename: 'bundle.js',
		clean: true
	},
	devtool: 'source-map',
};