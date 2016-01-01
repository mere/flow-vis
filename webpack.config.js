
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var package = require("./package.json")
var path = require('path');
var hostname = 'localhost'
var port = '4000'
//var webpack = require('webpack')

module.exports = {
  entry: {
    'nflow-vis': './src/',
    //'vendor': ['d3']
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'this',
    publicPath: 'http://' + hostname + ':' + port + '/dist/'
  },
  resolve:{
    root: path.resolve(__dirname, 'src'),
  },
  module: {
    loaders: [
      { test: /\.js$/
        , exclude: /node_modules/
        , loader: 'babel'
        , query: { presets: ['es2015', 'stage-0'] }},
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") }
    ]
  },
  stats: {
    colors: true,
    reasons: true
  },
  debug: true,
  cache: true,
  devtool: 'source-map',

  devServer: {
    progress: true,
    contentBase: ".",
    host: hostname,
    port: port
  },
  plugins: [
    new ExtractTextPlugin(package.name+".css"),
    //new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
  ]
}

