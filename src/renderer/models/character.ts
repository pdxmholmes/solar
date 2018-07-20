import { observable } from 'mobx';
import { Skill, QueuedSkill } from './skills';
import { IStorageWritable } from '../services';

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

export class CharacterAttributes {
  @observable
  public charisma: number;

  @observable
  public intelligence: number;

  @observable
  public memory: number;

  @observable
  public perception: number;

  @observable
  public willpower: number;

  constructor(data: any = {}) {
    this.charisma = data.charisma;
    this.intelligence = data.intelligence;
    this.memory = data.memory;
    this.perception = data.perception;
    this.willpower = data.willpower;
  }
}

export class Character implements IStorageWritable {
  public id: number;
  public refreshToken: string;
  public accessToken: string;
  public expires: Date;

  @observable
  public name: string;

  @observable
  public refreshState: RefreshState;

  @observable
  public refreshDetail: string;

  @observable
  public attributes: CharacterAttributes;

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

  constructor(data: any = {}) {
    this.id = data.id;
    this.name = data.name;
    this.refreshToken = data.refreshToken;
    this.attributes = new CharacterAttributes(data.attributes);
    this.skills = data.skills;
    this.skillQueue = data.skillQueue;
    this.totalSkillPoints = data.totalSkillPoints;
    this.unallocatedSkillPoints = data.unallocatedSkillPoints;
    this.portraits = data.portraits;
  }

  public asWritable(): any {
    return {
      id: this.id,
      name: this.name,
      refreshToken: this.refreshToken,
      attributes: this.attributes,
      skills: this.skills,
      skillQueue: this.skillQueue,
      totalSkillPoints: this.totalSkillPoints,
      unallocatedSkillPoints: this.unallocatedSkillPoints,
      portraits: this.portraits
    };
  }
}
