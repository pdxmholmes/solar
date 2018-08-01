import * as React from 'react';
import { Character } from '../models';
import { SkillGroup as EveSkillGroup } from '../../common/static';
import { staticDataService } from '../services';

interface SkillGroupProps {
  group: EveSkillGroup;
  character: Character;
}

export class SkillGroup extends React.Component<SkillGroupProps, {}> {
  public render() {
    const { group, character } = this.props;
    const types = staticDataService.data.skillData.skills.filter(skill => skill.groupId === group.id);
    const skillsForCharacter = types.reduce((finalSkills, type) => {
      const skill = character.skills.find(s => s.skillId === type.id);
      if (skill) {
        finalSkills.push({
          type,
          skill
        });
      }

      return finalSkills;
    }, []);

    return (
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <button
              className="btn btn-link collapsed"
              type="button"
              data-toggle="collapse"
              data-target={`#collapse${group.id}`}
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              {group.name}
            </button>
          </h5>
        </div>
        <div id={`collapse${group.id}`} className="collapse" data-parent="#skillAccordion">
          <div className="card-body">
            {skillsForCharacter.map(characterSkill =>
              <p key={characterSkill.type.id}>{characterSkill.type.name}: {characterSkill.skill.trainedLevel}</p>)}
          </div>
        </div>
      </div>
    );
  }
}
