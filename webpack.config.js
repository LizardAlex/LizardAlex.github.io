const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  // Entry main JS
  entry: {
    app: './src/index.js'
  },
  // Output main JS
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist'
  },
  // Server
  devServer: {
    // Help message !!!
    overlay: true
  },
  module: {
    rules: [
      {
        test: /\.(ttf|mp3|jpe?g|png|svg)(\?[a-z0-9=&.]+)?$/,
        use: 'base64-inline-loader?limit=1000&name=[name].[ext]',
      },
      {
        // Babel
        test: /\.js$/,
        loader: 'babel-loader',
        // Prevent node_modules !!!
        exclude: '/node_modules/'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HtmlWebpackPlugin({
      inlineSource: '.(js|css)$', // embed all javascript and css inline
      template: 'index.hbs',
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],
}
