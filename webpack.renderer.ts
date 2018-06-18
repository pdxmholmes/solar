import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

const port = 3000;

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
    './src/renderer/app'
  ],
  target: 'electron-renderer',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'renderer.js',
    publicPath: `http://localhost:${port}/dist`
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
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
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),

    new HtmlWebpackPlugin({
      title: 'EVE Solar',
      template: 'src/renderer/index.tpl.html'
    })
  ]
};
