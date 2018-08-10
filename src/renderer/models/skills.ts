import * as moment from 'moment';
import 'moment-duration-format';
import { observable, computed } from 'mobx';

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

  @computed
  public get finishedIn(): string {
    return moment.duration(moment(this.finishes).diff(moment())).format();
  }

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
  public skillId: number;

  @observable
  public activeLevel: number;

  @observable
  public trainedLevel: number;

  constructor(typeId: number, activeLevel: number, trainedLevel: number) {
    this.skillId = typeId;
    this.activeLevel = activeLevel;
    this.trainedLevel = trainedLevel;
  }
}
