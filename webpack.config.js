const path = require('path');

module.exports = {
	entry: './popup.js',
	output: {
		path: path.resolve(__dirname, 'dist'), // Replace with your desired output directory
		filename: 'bundle.js',
		clean: true
	},
	devtool: 'source-map',
};