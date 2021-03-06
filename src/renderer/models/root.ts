import * as Promise from 'bluebird';
import { action, observable } from 'mobx';
import { Character, Configuration } from './';
import { storageService, esiService } from '../services';

export class RootStore {
  @observable
  public configuration: Configuration;

  @observable
  public characters: Character[] = [];

  @action.bound
  public loadConfiguration(): Promise<Configuration> {
    return storageService.load<Configuration>('config', Configuration)
      .then(config => this.configuration = config);
  }

  @action.bound
  public loadCharacters(refresh: boolean = true): Promise<Character[]> {
    return storageService.loadAll<Character>('character-*.json', Character)
      .then(characters => {
        this.characters = characters || [];

        if (refresh) {
          return Promise.map(characters, character => esiService.refreshCharacter(character))
            .then(() => characters);
        }

        return this.characters;
      });
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
