import { action, observable } from 'mobx';
import { Character, Configuration } from './';
import { storageService } from '../services';

export class RootStore {
  @observable
  public configuration: Configuration;

  @observable
  public characters: Character[] = [];

  @action.bound
  public loadConfiguration(): Promise<Configuration> {
    return storageService.load<Configuration>('config')
      .then(config => this.configuration = config);
  }

  @action.bound
  public loadCharacters(): Promise<Character[]> {
    return storageService.loadAll<Character>('character-*.json')
      .then(characters => this.characters = characters || []);
  }

  @action.bound
  public addCharacter(character: Character) {
    if (this.characters.some(c => c.id === character.id)) {
      return;
    }

    this.characters.push(character);
  }
}

export const rootStore = new RootStore();
