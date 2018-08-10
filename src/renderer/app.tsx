import * as Bluebird from 'bluebird';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { configure } from 'mobx';

// import libraries bootstrap needs
import 'bootstrap';
import 'jquery';
import 'popper.js';

import { rootStore } from './models';
import { Solar } from './components/solar';

// import global CSS
import './app.global.scss';

// Setup font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { ipcRenderer } from 'electron';

library.add(far, fas, fab);

import { messages } from '../common';

// configure mobx
configure({
  enforceActions: true
});

const isDevelopment = process.env.NODE_ENV !== 'production';

// Bluebird/Promise magic
declare global {
  export interface Promise<T> extends Bluebird<T> { }
}

function bootstrapApp() {
  Promise.all([
    rootStore.loadConfiguration(),
    rootStore.loadCharacters()
  ]).then(() => {
    ReactDOM.render(
      <Solar store={rootStore} isDevelopment={isDevelopment} />,
      document.getElementById('root')
    );
  })
    .catch(error => {
      alert(`Something went terribly wrong starting Solar. Pleaee file a GitHub issue: ${error}`);
      ipcRenderer.sendSync(messages.fatalError, { error });
    });
}

bootstrapApp();
