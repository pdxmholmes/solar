import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Character } from '../models';

import { SkillList } from './';

interface CharacterDetailProps extends RouteComponentProps<any> {
  characters: Character[];
}

export class CharacterDetail extends React.Component<CharacterDetailProps, {}> {
  public render() {
    const id = parseInt(this.props.match.params.id, 10);
    const character = this.props.characters.find(c => c.id === id);
    return (
      <div>
        <h1>Hello {character.name}</h1>
        <div>
          <SkillList character={character} />
        </div>
      </div>
    );
  }
}
