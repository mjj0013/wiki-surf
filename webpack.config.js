const HTMLWebpackPlugin = require('html-webpack-plugin');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
	template: __dirname + '/public/index.html',
	filename: './index.html',
	inject: false
});
const path = require('path');

module.exports =  [
	// Client
	{
		entry: './src/index.js',
		mode:'development',
		module: {
			rules: [
			   {
				   test: /\.(js|jsx)$/, exclude: /node_modules/, use: {	loader: 'babel-loader'},
			   },
			   { 
				   test: /\.css$/, 
				   use: [
					   {  	loader: 'style-loader', options: {esModule: false}} ,
					   {	loader: 'css-loader',}
				]
			   },
			   {
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					  {	loader: 'file-loader', 	options: {name: 'img/[name].[ext]'}} ,
				],
			  },
	
			  {
				test: /\.svg$/,
				use: [  {	loader: 'svg-url-loader',options: {limit: 10000,},} ],
			  },
			]	
		},
		output:{
			filename: 'transformed.js',
			path: path.resolve(__dirname, 'public'),
			publicPath: '/',
			clean: true
		},
		devServer: {
			host: 'localhost',
			port: 8080,
			historyApiFallback: true,
			open: true,
			hot: true,
		},
		
		plugins: [HTMLWebpackPluginConfig,],
		resolve: {	
			extensions: [".js", ".jsx"],
			fallback: {
				"https":require.resolve("https-browserify"),
				"http":require.resolve("stream-http"),
				"url":require.resolve("url/")
			}
		},
	},



	// Server
	{
		entry: './src/server/index.js',
		target:'node',
		
		mode:'production',
		output: {
			libraryTarget:'commonjs',
			path: path.resolve(__dirname, 'public'),
			publicPath:'/',
			filename: 'server.js'
		},
		externals:[/^(?!\.|\/).+/i],
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/, exclude: /node_modules/, use: {	loader: 'babel-loader'},
				},
				{ 
					test: /\.css$/, 
					use: [
						{  	loader: 'style-loader', options: {esModule: false}} ,
						{	loader: 'css-loader',}
				 ]
				},
				{
				 test: /\.(png|jpe?g|gif)$/i,
				 use: [
					   {	loader: 'file-loader', 	options: {name: 'img/[name].[ext]'}} ,
				 ],
			   },
	 
			   {
				 test: /\.svg$/,
				 use: [
					   {	loader: 'svg-url-loader',options: {limit: 10000,},} ,
				 ],
			   },
			   {
				   test: /\.json$/,
				   use:[{loader: 'json',}]
			   }
			]
		},
		devServer: {
			host: 'localhost',
			port: 3000,
			historyApiFallback: true,
			open: true,
			hot: true,
		},
	}
	



];



// module.exports = {
// 	entry: './src/index.js',
// 	mode: 'development',
// 	module: {
// 		rules: [
// 		   {
// 		   	test: /\.(js|jsx)$/,
// 		   	exclude: /node_modules/,
// 		   	use: {	loader: 'babel-loader'},
// 		   },
// 		   { 
// 		   	test: /\.css$/, 
// 		   	use: [
// 		   		{  	loader: 'style-loader', options: {esModule: false}} ,
// 			   	{	loader: 'css-loader',}
// 			]
// 		   },
// 		   {
// 			test: /\.(png|jpe?g|gif)$/i,
// 			use: [
// 			  	{	loader: 'file-loader', 	options: {name: 'img/[name].[ext]'}} ,
// 			],
// 		  },

// 		  {
// 			test: /\.svg$/,
// 			use: [
// 			  	{	loader: 'svg-url-loader',options: {limit: 10000,},} ,
// 			],
// 		  },
// 		]	
// 	},
// 	output:{ filename:'transformed.js', path:path.resolve(__dirname, 'public'), publicPath:'/', clean: true },
// 	devServer: {host: 'localhost', port:8080, historyApiFallback:true, open:true, hot:true,},
// 	plugins: [HTMLWebpackPluginConfig,],
// 	resolve: {	
//         extensions: [".js", ".jsx"],
// 		fallback: {
// 			"https":require.resolve("https-browserify"),
// 			"http":require.resolve("stream-http"),
// 			"url":require.resolve("url/")
// 		}
//     },
// };
