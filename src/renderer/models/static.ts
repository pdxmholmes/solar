export class SkillGroup {
  constructor(
    public id: number,
    public name: string) { }
}

export class SkillType {
  constructor(
    public id: number,
    public name: string,
    public group: SkillGroup,
    public iconId: number) { }
}

export class StaticData {
  public groups: SkillGroup[] = [];
  public skills: SkillType[] = [];
}
