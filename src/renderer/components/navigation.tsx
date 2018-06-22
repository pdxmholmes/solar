import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { esiService } from '../services';
import { Character } from '../models';

const styles = require('./navigation.scss');

interface NavigationProps {
  characters: Character[];
}

interface NavigationItemProps {
  character: Character;
}

console.log(Object.keys(styles));

export class NavigationItem extends React.Component<NavigationItemProps, {}> {
  public render() {
    const { character } = this.props;
    return (
      <li className="nav-item" key={character.id}>
        <a href="#" onClick={this.onNavigate} className="nav-link">{character.name}</a>
      </li>
    );
  }

  private onNavigate = () => {
    return;
  }
}

@observer
export class Navigation extends React.Component<NavigationProps, {}> {
  public render() {
    const { characters } = this.props;
    return (
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <div className="sidebar-sticky">
          <h6 className="sidebar-heading text-muted">
            <span><a href="#" onClick={this.onNewCharacter}>Characters</a></span>
          </h6>
          <ul className="nav flex-column">
            {characters.map(character =>
              <NavigationItem character={character} />
            )}
          </ul>
        </div>
      </nav>
    );
  }

  private onNewCharacter = () => {
    esiService.authenticateNewCharacter();
  }
}
