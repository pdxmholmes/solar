import { observable } from 'mobx';
import { Skill, QueuedSkill } from './skills';
import { IStorageWritable } from '../services';

export enum RefreshState {
  refreshing = 'refreshing',
  upToDate = 'upToDate',
  error = 'error'
}

export interface CharacterPortraits {
  px64: string;
  px128: string;
  px256: string;
  px512: string;
}

export class Character implements IStorageWritable {
  public id: number;
  public refreshToken: string;
  public accessToken: string;
  public expires: Date;

  @observable
  public name: string;

  @observable
  public refreshState: RefreshState;

  @observable
  public refreshDetail: string;

  @observable
  public skills: Skill[];

  @observable
  public skillQueue: QueuedSkill[];

  @observable
  public totalSkillPoints: number;

  @observable
  public unallocatedSkillPoints: number;

  @observable
  public portraits: CharacterPortraits;

  public asWritable(): any {
    return {
      id: this.id,
      name: this.name,
      refreshToken: this.refreshToken,
      skills: this.skills,
      skillQueue: this.skillQueue,
      totalSkillPoints: this.totalSkillPoints,
      unallocatedSkillPoints: this.unallocatedSkillPoints,
      portraits: this.portraits
    };
  }
}
