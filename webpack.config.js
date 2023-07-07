const path = require('path');

module.exports = {
	entry: {
		background: './content-script.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'), // Replace with your desired output directory
		filename: 'content-script.bundle.js',
		clean: true
	},
	devtool: 'source-map',
};