import { SkillType, SkillGroup, StaticSkills, SkillPointTable } from '../../common/static';

export interface StaticData {
  skillData: StaticSkills;
  spTable: SkillPointTable;
}

let staticData: StaticData = null;
class StaticDataService {
  constructor() {
    staticData = {
      skillData: require('../../../static/skills.json') as StaticSkills,
      spTable: require('../../../static/sptable.json') as SkillPointTable
    };
  }
  public get data(): StaticData {
    return staticData;
  }

  public getSkillTypeById = (id: number): SkillType => {
    return staticData.skillData.skills.find(skill => skill.id === id);
  }

  public getSkillGroupById = (id: number): SkillGroup => {
    return staticData.skillData.groups.find(group => group.id === id);
  }
}

export const staticDataService = new StaticDataService();
