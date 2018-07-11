import * as React from 'react';
import { RootStore, Character} from '../models';

import { SkillGroup } from './';

interface SkillListProps {
  store: RootStore;
  character: Character;
}

export class SkillList extends React.Component<SkillListProps, {}> {
  public render() {
    const { character, store } = this.props;
    const groups = store.staticData.groups;
    return (
      <div className="accordion" id="skillAccordion">
        {groups.map(group => (
          <SkillGroup
            key={group.id}
            group={group}
            store={store}
            character={character}
          />))}
      </div>
    );
  }
}
