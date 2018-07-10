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

export class StaticData {
  public attributes: DogmaAttribute[] = [];
  public groups: SkillGroup[] = [];
  public skills: SkillType[] = [];
}
