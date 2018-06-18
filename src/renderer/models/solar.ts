import { action, observable } from 'mobx';
import { Character } from './character';

export class SolarStore {
  @observable characters: Character[] = [];

  @action.bound
  addCharacter(character: Character) {
    this.characters.push(character);
  }
}
