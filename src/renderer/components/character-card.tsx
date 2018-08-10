import * as React from 'react';
import * as moment from 'moment';
import { orderBy } from 'lodash';
import { Character, RefreshState } from '../models';
import { staticDataService } from '../services';
import { observer } from 'mobx-react';

const styles = require('./character-card.scss');

interface CharacterCardProps {
  character: Character;
}

@observer
export class CharacterCard extends React.Component<CharacterCardProps, {}> {
  public render() {
    const { character } = this.props;
    const currentlyTraining = character.currentlyTraining;
    const currentlyTrainingType =
      currentlyTraining ? staticDataService.getSkillTypeById(currentlyTraining.skillId) : null;
    const currentTrainingLabel = currentlyTrainingType
      ? `${currentlyTrainingType.name} ${currentlyTraining.finishedLevel}`
      : 'None';

    return (
      <div className={`card ${styles.characterCard}`}>
        <img className="card-img-top" src={character.portraits.px256} />
        <div className="card-body">
          <h5 className="card-title">{character.name}</h5>
          <p><b>Total SP:</b> {character.totalSkillPoints.toLocaleString('en')}</p>
          <p><b>Currently Training:</b> {currentTrainingLabel}</p>
          {currentlyTraining &&
            <p>{currentlyTraining.finishedIn}</p>
          }
          {character.refreshDetail &&
            <p>Refresh Error: {character.refreshDetail}</p>
          }
        </div>
      </div>
    );
  }
}
