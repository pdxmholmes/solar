import * as express from 'express';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as minimist from 'minimist';
import { spawn } from 'child_process';

const config = require('./webpack.renderer');

const argv = minimist(process.argv.slice(2));

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
