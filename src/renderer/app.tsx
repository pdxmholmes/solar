import * as Bluebird from 'bluebird';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';

import { rootStore, SolarStore, Configuration, Character } from './models';

import { Navigation } from './components/navigation';

// import libraries bootstrap needs
import 'bootstrap';
import 'jquery';
import 'popper.js';

import './app.global.scss';
import { NavigationService, storageService } from './services';

const isDevelopment = process.env.NODE_ENV !== 'production';
const navigationService = new NavigationService();

// Bluebird/Promise magic
declare global {
  export interface Promise<T> extends Bluebird<T> {}
}

@observer
class Solar extends React.Component<{ store: SolarStore }, {}> {
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

storageService.load<Configuration>('config')
  .then(config => {
    rootStore.configuration = config;
    console.log(config);
  })
  .then(() => storageService.loadAll<Character>('character-*.json'))
  .then(characters => rootStore.characters = characters || [])
  .then(() => {
    ReactDOM.render(
      <Solar store={rootStore} />,
      document.getElementById('root')
    );
  });
