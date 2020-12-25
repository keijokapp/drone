const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const resolveApp = relativePath => path.resolve(__dirname, relativePath);

const publicUrl = 'PUBLIC_URL' in process.env ? process.env.PUBLIC_URL : '';
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
	mode: isDev ? 'development' : 'production',
	devtool: isDev ? 'cheap-module-source-map' : 'source-map',
	entry: isDev
		? [
			'react-dev-utils/webpackHotDevClient',
			resolveApp('src/index.js')
		]
		: resolveApp('src/index.js'),
	optimization: {
		splitChunks: {
			chunks: 'all'
		}
	},
	devServer: {
		injectClient: false,
		transportMode: 'ws',
		contentBase: resolveApp('public'),
		contentBasePublicPath: publicUrl,
		watchContentBase: isDev,
		hot: isDev,
		historyApiFallback: {
			// Paths with dots should still use the history fallback.
			// See https://github.com/facebook/create-react-app/issues/387.
			disableDotRule: true,
			index: publicUrl
		}
	},
	module: {
		rules: [
			{
				oneOf: [
					{
						test: /\.(gif|jpe?g|png)$/,
						loader: 'url-loader',
						options: {
							limit: 10000,
							name: 'static/media/[name].[hash:8].[ext]'
						}
					},
					{
						test: /\.js$/,
						include: resolveApp('src'),
						loader: 'babel-loader',
						options: {
							plugins: [
								[
									'babel-plugin-named-asset-import',
									{
										loaderMap: {
											svg: {
												ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]'
											}
										}
									}
								]
							],
							cacheDirectory: true,
							cacheCompression: false
						}
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin(
			{
				template: resolveApp('src/index.html'),
				minify: isDev ? undefined : {
					removeComments: true,
					collapseWhitespace: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeStyleLinkTypeAttributes: true,
					keepClosingSlash: true,
					minifyJS: true,
					minifyCSS: true,
					minifyURLs: true
				}
			}
		),
		new InterpolateHtmlPlugin(HtmlWebpackPlugin, { PUBLIC_URL: publicUrl }),
		new webpack.DefinePlugin({
			process: {},
			'process.env': {},
			'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
			'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
			'config.signalingServerEndpoint': JSON.stringify('ws://localhost:3000')
		})
	]
};
