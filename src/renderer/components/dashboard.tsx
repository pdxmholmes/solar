import * as React from 'react';
import { RootStore } from '../models';
import { CharacterCard } from './character-card';
import { RouteComponentProps } from 'react-router';

interface DashboardProps extends RouteComponentProps<any> {
  store: RootStore;
}

export class Dashboard extends React.Component<DashboardProps, {}> {
  public render() {
    const { characters } = this.props.store;
    return characters.map(character => <CharacterCard key={character.id} character={character} />);
  }
}
