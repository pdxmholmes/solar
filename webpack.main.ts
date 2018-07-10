import * as path from 'path';
import * as webpack from 'webpack';

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: ['./src/main/index'],
  target: 'electron-main',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader'
          }
        ],
        include: [
          path.join(__dirname, 'src/common'),
          path.join(__dirname, 'src/main')
        ]
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
