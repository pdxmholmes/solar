import * as React from 'react';
import { observer } from 'mobx-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { esiService } from '../services';
import { Character } from '../models';
import { NavigationItem } from './navigation-item';

interface NavigationProps {
  characters: Character[];
}

@observer
export class Navigation extends React.Component<NavigationProps, {}> {
  public render() {
    const { characters } = this.props;
    return (
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <div className="sidebar-sticky">
          <h6 className="sidebar-heading text-muted">
            <span>
              Characters
              <a href="#" onClick={this.onNewCharacter}><FontAwesomeIcon icon="plus" /></a>
            </span>
          </h6>
          <ul className="nav flex-column">
            {characters.map(character =>
              <NavigationItem key={character.id} character={character} />
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
