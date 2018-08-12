import * as React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Character, RefreshState } from '../models';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const styles = require('./navigation-item.scss');

interface NavigationItemProps {
  character: Character;
}

@observer
export class NavigationItem extends React.Component<NavigationItemProps, {}> {
  public render() {
    const { character } = this.props;
    const icon = this.getRefreshStateIcon(character);
    return (
      <li className="nav-item justify-content-between align-items-center d-flex">
        <Link to={`/character/${character.id}`} className="nav-link">
          <img className={styles.characterPortrait} src={character.portraits.px64} width="32" height="32" />
          {character.name}
        </Link>
        {icon &&
          <FontAwesomeIcon className="ml-1" icon={icon} />
        }
      </li>
    );
  }

  private getRefreshStateIcon(character: Character): IconName {
    switch (character.refreshState) {
      case RefreshState.invalidToken:
        return 'lock';
      case RefreshState.error:
        return 'exclamation';
      case RefreshState.refreshing:
        return 'sync-alt';
      default:
        return null;
    }
  }
}
