import * as React from 'react';
import { Character } from '../models';

const styles = require('./navigation-item.scss');

interface NavigationItemProps {
  character: Character;
}

export class NavigationItem extends React.Component<NavigationItemProps, {}> {
  public render() {
    const { character } = this.props;
    return (
      <li className="nav-item">
        <a href="#" onClick={this.onNavigate} className="nav-link">{character.name}</a>
      </li>
    );
  }

  private onNavigate = () => {
    return;
  }
}
