import { action, observable } from 'mobx';
import { Character, Configuration } from './';

export class RootStore {
  @observable
  public configuration: Configuration;

  @observable
  public characters: Character[] = [];

  @action.bound
  public addCharacter(character: Character) {
    if (this.characters.some(c => c.id === character.id)) {
      return;
    }

    this.characters.push(character);
  }
}

export const rootStore = new RootStore();
