import * as React from 'react';
import { RootStore, Character} from '../models';
import { staticDataService } from '../services';

import { SkillGroup } from './';

interface SkillListProps {
  character: Character;
}

export class SkillList extends React.Component<SkillListProps, {}> {
  public render() {
    const { character } = this.props;
    const groups = staticDataService.data.groups;
    return (
      <div className="accordion" id="skillAccordion">
        {groups.map(group => (
          <SkillGroup
            key={group.id}
            group={group}
            character={character}
          />))}
      </div>
    );
  }
}
