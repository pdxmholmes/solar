import { observable } from 'mobx';
import { Skill, QueuedSkill } from './skills';

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

export class Character {
  @observable
  public id: number;

  @observable
  public name: string;

  @observable
  public refreshToken: string;

  @observable
  public refreshState: RefreshState;

  @observable
  public accessToken: string;

  @observable
  public expires: Date;

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
}
