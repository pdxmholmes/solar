import * as path from 'path';
import { app, BrowserWindow } from 'electron';
//import * as reload from 'electron-reload';

//reload(path.join(__dirname, 'dist'));

let mainWindow: BrowserWindow = null;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
