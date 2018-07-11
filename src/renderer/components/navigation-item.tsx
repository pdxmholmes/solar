import * as React from 'react';
import { Link } from 'react-router-dom';
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
        <Link to={`/character/${character.id}`} className="nav-link">
          <img className={styles.characterPortrait} src={character.portraits.px64} width="32" height="32" />
          {character.name}
        </Link>
      </li>
    );
  }
}
