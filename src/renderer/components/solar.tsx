import * as React from 'react';
import { BrowserRouter as Router, Route, RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';

import { RootStore } from '../models';
import { Navigation, Dashboard, CharacterDetail } from './';

interface SolarProps {
  isDevelopment: boolean;
  store: RootStore;
}

// Force us to the / location for react-router
window.history.pushState(null, window.document.title, '/');

@observer
export class Solar extends React.Component<SolarProps, {}> {
  public render() {
    const { isDevelopment } = this.props;
    const { characters } = this.props.store;
    return (
      <Router>
        <div className="container-fluid">
          <div className="row">
            <div className="col-2">
              <Navigation characters={characters} />
            </div>

            <div className="col-10">
              <Route exact={true} path="/" render={this.renderDashboard} />
              <Route path="/character/:id" render={this.renderCharacterDetail} />
            </div>
          </div>

          {isDevelopment &&
            <DevTools />
          }
        </div>
      </Router>
    );
  }

  private renderDashboard = (props: RouteComponentProps<any>) => {
    return <Dashboard characters={this.props.store.characters} {...props} />;
  }

  private renderCharacterDetail = (props: RouteComponentProps<any>) => {
    return <CharacterDetail characters={this.props.store.characters} {...props} />;
  }
}
