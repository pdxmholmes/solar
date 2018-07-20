import * as React from 'react';
import { observer } from 'mobx-react';
import { RootStore, Character } from '../models';
import { CharacterCard } from './character-card';
import { RouteComponentProps } from 'react-router';

interface DashboardProps extends RouteComponentProps<any> {
  characters: Character[];
}

@observer
export class Dashboard extends React.Component<DashboardProps, {}> {
  public render() {
    const { characters } = this.props;
    return characters.map(character =>
      <CharacterCard key={character.id} character={character} />);
  }
}
