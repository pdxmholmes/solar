import * as React from 'react';
import { SkillGroup as EveSkillGroup, Character, RootStore } from '../models';

interface SkillGroupProps {
  store: RootStore;
  group: EveSkillGroup;
  character: Character;
}

export class SkillGroup extends React.Component<SkillGroupProps, {}> {
  public render() {
    const { group, store, character } = this.props;
    const types = store.staticData.skills.filter(skill => skill.groupId === group.id);
    const skillsForCharacter = types.reduce((finalSkills, type) => {
      const skill = character.skills.find(s => s.typeId === type.id);
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
