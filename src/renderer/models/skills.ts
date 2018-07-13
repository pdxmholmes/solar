import { observable } from 'mobx';
import { SkillType } from './';

export class QueuedSkill {
  @observable
  public finishes: Date;

  @observable
  public finishedLevel: number;

  @observable
  public levelStartSp: number;

  @observable
  public levelEndSp: number;

  @observable
  public queuePosition: number;

  @observable
  public skillId: number;

  @observable
  public started: Date;

  @observable
  public trainingStartSp: number;

  constructor(
    finishes: Date, finishedLevel: number, levelStartSp: number, levelEndSp: number,
    queuePosition: number, skillId: number, started: Date, trainingStartSp: number) {
      this.finishes = finishes;
      this.finishedLevel = finishedLevel;
      this.levelStartSp = levelStartSp;
      this.levelEndSp = levelEndSp;
      this.queuePosition = queuePosition;
      this.skillId = skillId;
      this.started = started;
      this.trainingStartSp = trainingStartSp;
    }
}

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
