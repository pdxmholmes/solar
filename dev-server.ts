import * as express from 'express';

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const { spawn } = require('child_process');

const config = require('./webpack.renderer');

const argv = require('minimist')(process.argv.slice(2));

const app = express();
const compiler = webpack(config);

const PORT = process.env.PORT;
const port = PORT ? Number(PORT) : 3000;

const wdm = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
});

app.use(wdm);
app.use(webpackHotMiddleware(compiler));

const server = app.listen(port, 'localhost', error => {
  if (error) {
    return console.error(error);
  }

  if (argv['start-hot']) {
    spawn('npm', ['run', 'start-hot'], {
      shell: true,
      env: process.env,
      stdio: 'inherit'
    })
      .on('close', code => process.exit(code))
      .on('error', spawnError => console.error(spawnError));
  }
});

process.on('SIGTERM', () => {
  console.log('Stopping dev server');
  wdm.close();
  server.close(() => {
    process.exit(0);
  });
});
