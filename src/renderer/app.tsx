import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';

import { SolarStore } from './models';

import { Navigation } from './components/navigation';

// import libraries bootstrap needs
import 'bootstrap';
import 'jquery';
import 'popper.js';

import './app.global.scss';
import { NavigationService } from './services';

const isDevelopment = process.env.NODE_ENV !== 'production';
const navigationService = new NavigationService();

@observer
class Solar extends React.Component<{ store: SolarStore }, {}> {
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <Navigation navigation={navigationService} />
        </div>
        {isDevelopment &&
          <DevTools />
        }
      </div>
    );
  }
}

const store = new SolarStore();
ReactDOM.render(
  <Solar store={store} />,
  document.getElementById('root')
);
