import { observable } from 'mobx';

export class Configuration {
  @observable
  public clientId: string;

  @observable
  public clientSecret: string;

  constructor(data: any) {
    this.clientId = data.clientId;
    this.clientSecret = data.clientSecret;
  }
}
