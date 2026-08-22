const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
	mode: isProd ? 'production' : 'development',

	entry: './source/js/main.js',

	output: {
		path: path.resolve(__dirname, 'build'),
		filename: isProd ? 'js/main.min.js' : 'js/main.js',
		clean: {
			keep: /\.html$/,
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
			// Fonts
			{
				test: /\.(woff2?|eot|ttf|otf)$/,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[name][ext][query]'
				}
			},
			// SVG icons
			{
				test: /\.svg$/,
				type: 'asset/resource',
				generator: {
					filename: 'icons/[name][ext][query]'
				}
			},
			// Pictures
			{
				test: /\.(png|jpe?g|gif)$/,
				type: 'asset/resource',
				generator: {
					filename: 'images/[name][ext][query]'
				}
			}
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
			'...', // TerserPlugin for JS
			new CssMinimizerPlugin(),
		],
	},

	devtool: isProd ? false : 'source-map',

	devServer: {
		static: {
			directory: path.join(__dirname, 'build'),
		},
		devMiddleware: {
			writeToDisk: true,
		},
		open: true,
		hot: true,
		port: 8080,
	},
};