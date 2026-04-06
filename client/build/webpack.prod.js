var path = require('path')
var merge = require('webpack-merge').merge
var base = require('./webpack.dev')

module.exports = merge(base, {
  mode: 'production',
  output: {
    filename: 'js/[name].[chunkhash].js',
  },
  devtool: false,
})
