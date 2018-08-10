import * as React from 'react';
import { SkillGroup } from '../../common/static';

interface SkillGroupProgressProps {
  group: SkillGroup;
  index: number;
  total: number;
}

export class SkillGroupProgress extends React.Component<SkillGroupProgressProps, {}> {
  public render() {
    const { group, index, total } = this.props;
    return (
      <React.Fragment>
        <div className="col">
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={{width: '90%'}} />
            <small className="justify-content-center d-flex position-absolute w-100">{group.name}</small>
          </div>
        </div>
        {(index + 1) % 3 === 0 &&
          <div className="w-100" />
        }
        {(index + 1) % 3 !== 0 && index === total - 1 &&
          <div className="col">&nbsp;</div>
        }
      </React.Fragment>
    );
  }
}
