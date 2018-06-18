import { observable } from 'mobx';

export class Character {
  @observable id: string;
  @observable name: string;
  @observable refreshToken: string;
}
