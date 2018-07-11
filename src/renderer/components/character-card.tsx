import * as React from 'react';
import { Character } from '../models';

const styles = require('./character-card.scss');

interface CharacterCardProps {
  character: Character;
}

export class CharacterCard extends React.Component<CharacterCardProps, {}> {
  public render() {
    const { character } = this.props;
    return (
      <div className={`card ${styles.characterCard}`}>
        <img className="card-img-top" src={character.portraits.px256} />
        <div className="card-body">
          <h5 className="card-title">{character.name}</h5>
          <p><b>Total SP:</b> {character.totalSkillPoints}</p>
        </div>
      </div>
    );
  }
}
