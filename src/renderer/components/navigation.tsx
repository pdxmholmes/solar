import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { NavigationService, NavigationTab } from '../services';

import './navigation.scss';

class NavigationProps {
  navigation: NavigationService;
}

class NavigationItemProps {
  tab: NavigationTab
}

export class NavigationItem extends React.Component<NavigationItemProps, {}> {
  render() {
    const { tab } = this.props;
    const classes = tab.active ? 'nav-link active' : 'nav-link';
    return (
      <li className="nav-item">
        <a href="#" className={classes}>{tab.title}</a>
      </li>
    )
  }

  onNavigate = () => {
    const { tab } = this.props;
    alert(`${tab.title} = ${tab.route}`);
  }
}

@observer
export class Navigation extends React.Component<NavigationProps, {}> {
  render() {
    const { navigation } = this.props;
    return (
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <div className="sidebar-sticky">
          <h6 className="sidebar-heading text-muted">
            <span>Characters</span>
          </h6>
          <ul className="nav flex-column">
            {navigation.tabs.map(tab =>
              <NavigationItem tab={tab} />
            )}
          </ul>
        </div>
      </nav>
    )
  }
}
