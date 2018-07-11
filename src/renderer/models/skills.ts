import { observable } from 'mobx';
import { SkillType } from './';

export class Skill {
  @observable
  public typeId: number;

  @observable
  public activeLevel: number;

  @observable
  public trainedLevel: number;

  constructor(typeId: number, activeLevel: number, trainedLevel: number) {
    this.typeId = typeId;
    this.activeLevel = activeLevel;
    this.trainedLevel = trainedLevel;
  }
}
