import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: ['./src/renderer/app'],
  target: 'electron-renderer',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'renderer.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'EVE Solar',
      template: 'src/renderer/index.tpl.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',            
          },
          {
            loader: 'css-loader'
          }
        ]
      },      
      {
        test: /\.global\.scss$/,
        use: [
          {
            loader: 'style-loader'            
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /^((?!\.global).)*\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]'
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader'
          }
        ],
        include: path.join(__dirname, 'src/renderer')
      }
    ]
  }
};
