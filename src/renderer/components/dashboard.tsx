import * as React from 'react';
import { observer } from 'mobx-react';
import { RootStore } from '../models';
import { CharacterCard } from './character-card';
import { RouteComponentProps } from 'react-router';

interface DashboardProps extends RouteComponentProps<any> {
  store: RootStore;
}

@observer
export class Dashboard extends React.Component<DashboardProps, {}> {
  public render() {
    const { characters } = this.props.store;
    return characters.map(character =>
      <CharacterCard key={character.id} store={this.props.store} character={character} />);
  }
}
