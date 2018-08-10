import * as React from 'react';
import { RootStore, Character} from '../models';
import { staticDataService } from '../services';
import { SkillGroupProgress } from './';

interface SkillListProps {
  character: Character;
}

export class SkillList extends React.Component<SkillListProps, {}> {
  public render() {
    const { character } = this.props;
    const groups = staticDataService.data.skillData.groups;
    return (
      <div className="container-fluid">
        <div className="row">
          {groups.map((group, idx) =>
            <SkillGroupProgress key={group.id} group={group} index={idx} total={groups.length} />)}
        </div>
      </div>
    );
  }
}

/*
      <div className="accordion" id="skillAccordion">
        {groups.map((group, idx) => {
          return (<SkillGroup
            key={group.id}
            group={group}
            character={character}
          />);
        })}
      </div>*/
