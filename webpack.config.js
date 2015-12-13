
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: [
    './src/main.js'
  ],

  output: {
    filename: 'flow-vis.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'this'
  },
  externals:{
    d3:'d3'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', query: { presets: ['es2015'] }},
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") },
      { test: /\.html$/, loaders: [ 'raw' ] },
    ]
  },

  plugins: [
    new ExtractTextPlugin("styles.css")
  ],
  devServer: {
      progress: true,
      contentBase: "/dist",
    },

}
