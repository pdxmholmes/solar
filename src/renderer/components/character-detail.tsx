import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RootStore } from '../models';

import { SkillList } from './';

interface CharacterDetailProps extends RouteComponentProps<any> {
  store: RootStore;
}

export class CharacterDetail extends React.Component<CharacterDetailProps, {}> {
  public render() {
    const id = parseInt(this.props.match.params.id, 10);
    const character = this.props.store.characters.find(c => c.id === id);
    return (
      <div>
        <h1>Hello {character.name}</h1>
        <div>
          <SkillList store={this.props.store} character={character} />
        </div>
      </div>
    );
  }
}
