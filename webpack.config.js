const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
	mode: isProd ? 'production' : 'development',

	// Точка входа — только JS. SCSS подтянем через import внутри main.js
	entry: './source/js/main.js',

	output: {
		path: path.resolve(__dirname, 'build'),
		filename: isProd ? 'js/main.min.js' : 'js/main.js',
		clean: {
			keep: /\.html$/, // не удалять файлы, заканчивающиеся на .html
		},
	},

	module: {
		rules: [
			// JS
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
			// SCSS → CSS
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader, // выносит CSS в файл
					'css-loader',                // разрешает импорты в CSS
					'postcss-loader',            // ← autoprefixer
					'sass-loader',               // компилирует SCSS
				],
			},
		],
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: isProd ? 'css/main.min.css' : 'css/main.css',
		}),
	],

	optimization: {
		minimize: isProd,
		minimizer: [
			'...', // стандартный TerserPlugin для JS
			new CssMinimizerPlugin(), // минификация CSS
		],
	},

	devtool: isProd ? false : 'source-map',

	devServer: {
		static: {
			directory: path.join(__dirname, 'build'),
		},
		devMiddleware: {
			writeToDisk: true, // пишет файлы на диск, а не только в память
		},
		open: true,  // открывает браузер
		hot: true,   // Hot Module Replacement
		port: 8080,
	},
};