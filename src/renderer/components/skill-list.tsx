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
    const groups = staticDataService.data.skillData.groups;
    return (
      <div className="container-fluid">
        <div className="row">
          {groups.map((group, idx) => {
            if (idx > 0 && idx % 3 === 0) {
              return (
                <React.Fragment>
                  <div className="col">
                    <div className="progress">
                      <div className="progress-bar" role="progressbar" />
                      <small className="justify-content-center d-flex position-absolute w-100">{group.name}</small>
                    </div>
                  </div>
                  <div className="w-100" />
                </React.Fragment>
              );
            } else {
              return (
                <div className="col">
                  <div className="progress">
                      <div className="progress-bar" role="progressbar" />
                      <small className="justify-center-content d-flex position-absolute w-100">{group.name}</small>
                    </div>
                </div>
              );
            }
          })}
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
