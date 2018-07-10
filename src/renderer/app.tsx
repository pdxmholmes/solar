import * as Bluebird from 'bluebird';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { configure } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';

// import libraries bootstrap needs
import 'bootstrap';
import 'jquery';
import 'popper.js';

import { rootStore, RootStore } from './models';
import { Navigation } from './components/navigation';

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

@observer
class Solar extends React.Component<{ store: RootStore }, {}> {
  public render() {
    const { configuration } = this.props.store;
    return (
      <div className="container-fluid">
        <div className="row">
          <Navigation characters={rootStore.characters} />
        </div>
        {isDevelopment &&
          <DevTools />
        }
      </div>
    );
  }
}

Promise.all([
  rootStore.loadConfiguration(),
  rootStore.loadCharacters()
]).then(() => {
  ReactDOM.render(
    <Solar store={rootStore} />,
    document.getElementById('root')
  );
})
  .catch(error => {
    alert(`Something went terribly wrong starting Solar. Pleaee file a GitHub issue: ${error}`);
    ipcRenderer.sendSync(messages.fatalError, { error });
  });
