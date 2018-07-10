import { observable } from 'mobx';
import { Skill } from './skills';

export enum RefreshState {
  refreshing = 'refreshing',
  upToDate = 'upToDate',
  error = 'error'
}

export class Character {
  @observable
  public id: string;

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
  public totalSkillPoints: number;

  @observable
  public unallocatedSkillPoints: number;
}
