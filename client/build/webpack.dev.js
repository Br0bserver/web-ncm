var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  entry: path.resolve(__dirname, '../src/main.js'),
  output: {
    path: path.resolve(__dirname, '../../client/dist'),
    filename: 'js/[name].[chunkhash].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, '../src')],
        exclude: /node_modules/,
        options: {
          presets: [
            ['@babel/preset-env', {
              targets: { chrome: '40' },
              useBuiltIns: 'usage',
              corejs: 3,
            }],
          ],
        },
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: { limit: 10000, name: 'img/[name].[hash:7].[ext]' },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: { limit: 10000, name: 'fonts/[name].[hash:7].[ext]' },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      inject: true,
    }),
  ],
  devtool: 'cheap-module-eval-source-map',
}
