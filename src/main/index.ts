import * as http from 'http';
import * as url from 'url';
import { app, BrowserWindow, protocol, ipcMain } from 'electron';
import { Server } from 'net';

import { messages } from '../common';

const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow = null;
let server: Server = null;
const devPort = 9999;

function setupSsoHandler() {
  if (isDevelopment) {
    server = http.createServer((request, response) => {
      const queryParameters = url.parse(request.url, true).query;

      mainWindow.webContents.send(messages.sso.receivedAuthCode, queryParameters);

      response.statusCode = 200;
      response.end();
    });

    server.listen(devPort, 'localhost', err => {
      if (err) {
        throw err;
      }

      console.log(`Dev SSO server listening on ${devPort}`);
    });
  } else {
    protocol.registerHttpProtocol('eveauth-solar', request => {
      console.log(request);
    });
  }
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768
  });

  (global as any).userStoragePath = app.getPath('userData');

  setupSsoHandler();

  // TODO: Gate this on development, load the file directly for prod
  mainWindow.loadURL('http://localhost:3000/dist/index.html');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.maximize();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on(messages.fatalError, ({ error }) => {
    console.error(error);
    app.exit(1);
  });
});
