import { observable } from 'mobx';

export class Configuration {
  @observable
  public clientId: string;

  @observable
  public clientSecret: string;
}
