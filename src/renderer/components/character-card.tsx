import * as React from 'react';
import { Character } from '../models';
import { staticDataService } from '../services';

const styles = require('./character-card.scss');

interface CharacterCardProps {
  character: Character;
}

export class CharacterCard extends React.Component<CharacterCardProps, {}> {
  public render() {
    const { character } = this.props;
    const currentlyTraining =
      character.skillQueue.length ?
      character.skillQueue.find(skill => skill.queuePosition === 0) :
      null;
    const currentlyTrainingType =
      currentlyTraining ? staticDataService.getSkillTypeById(currentlyTraining.skillId) : null;
    const currentTrainingLabel = currentlyTrainingType ? currentlyTrainingType.name : 'None';

    return (
      <div className={`card ${styles.characterCard}`}>
        <img className="card-img-top" src={character.portraits.px256} />
        <div className="card-body">
          <h5 className="card-title">{character.name}</h5>
          <p><b>Total SP:</b> {character.totalSkillPoints.toLocaleString('en')}</p>
          <p><b>Currently Training:</b> {currentTrainingLabel}</p>
        </div>
      </div>
    );
  }
}
