import { observable } from 'mobx';

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
  public refreshDetail: string;
}
