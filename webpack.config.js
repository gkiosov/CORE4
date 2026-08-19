const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	mode: isProduction ? 'production' : 'development',

	entry: {
		main: './source/js/main.js',
		// Если нужен отдельный файл для страниц
		// admin: './source/js/admin.js'
	},

	output: {
		path: path.resolve(__dirname, 'build/js'),
		filename: isProduction ? '[name].min.js' : '[name].js',
		clean: true
	},

	devtool: isProduction ? false : 'source-map',

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: '../build/css/[name].css'
		})
	],

	optimization: {
		minimize: isProduction,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: isProduction,
						drop_debugger: isProduction
					}
				}
			}),
			new CssMinimizerPlugin()
		]
	},

	devServer: {
		static: {
			directory: path.join(__dirname, 'build'),
		},
		port: 3000,
		open: true, // Автоматически открывать браузер
		hot: true,  // Горячая перезагрузка
		liveReload: true,
		watchFiles: ['source/**/*.js', 'source/**/*.scss', '*.html']
	},

	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'source')
		}
	},

	watchOptions: {
		ignored: /node_modules/
	}
};