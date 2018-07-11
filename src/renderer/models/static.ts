export class DogmaAttribute {
  constructor(
    public id: number,
    public name: string,
    public displayName: string,
    public description: string
  ) { }
}
export class SkillGroup {
  constructor(
    public id: number,
    public name: string) { }
}

export class SkillType {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public groupId: number,
    public iconId: number,
    public graphicId: number,
    public attributes: {
      id: number,
      value: number
    }) { }
}

export interface StaticData {
  attributes: DogmaAttribute[];
  groups: SkillGroup[];
  skills: SkillType[];

  getSkillTypeById(id: number): SkillType;
  getSkillGroupById(id: number): SkillGroup;
  getDogmaAttributeById(id: number): DogmaAttribute;
}

export const staticData = require('../../../static/static.json') as StaticData;
staticData.getSkillTypeById = (id: number): SkillType => {
  return staticData.skills.find(skill => skill.id === id);
};

staticData.getSkillGroupById = (id: number): SkillGroup => {
  return staticData.groups.find(group => group.id === id);
};

staticData.getDogmaAttributeById = (id: number): DogmaAttribute => {
  return staticData.attributes.find(attribute => attribute.id === id);
};
