import { observable } from 'mobx';
import { SkillType } from './';

export class Skill {
  @observable
  public type: SkillType;

  @observable
  public level: number;
}
