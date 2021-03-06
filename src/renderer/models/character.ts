import * as moment from 'moment';
import { orderBy } from 'lodash';
import { action, observable, computed } from 'mobx';
import { Skill, QueuedSkill } from './skills';
import { IStorageWritable } from '../services';

export const enum RefreshState {
  refreshing = 'refreshing',
  upToDate = 'upToDate',
  invalidToken = 'invalidToken',
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

  @computed
  public get currentlyTraining(): QueuedSkill {
    const notFinishedSkills = (this.skillQueue || []).filter(skill => moment(skill.finishes).isAfter(moment()));
    if (notFinishedSkills.length < 1) {
      return null;
    }

    return orderBy(notFinishedSkills, 'queuePosition')[0];
  }

  constructor(data: any = {}, accessToken?: string) {
    this.id = data.id;
    this.name = data.name;
    this.refreshToken = data.refreshToken;
    this.attributes = new CharacterAttributes(data.attributes);
    this.skills = data.skills;
    this.skillQueue = data.skillQueue;
    this.totalSkillPoints = data.totalSkillPoints;
    this.unallocatedSkillPoints = data.unallocatedSkillPoints;
    this.portraits = data.portraits;
    this.accessToken = accessToken;
  }

  @action.bound
  public beginRefresh(refreshToken: string, accessToken: string) {
    this.refreshToken = refreshToken;
    this.accessToken = accessToken;
    this.refreshState = RefreshState.refreshing;
    this.refreshDetail = null;
  }

  @action.bound
  public finalizeRefresh(attributes: CharacterAttributes, portraits: CharacterPortraits, skills: Skill[],
    totalSkillPoints: number, unallocatedSkillPoints: number, skillQueue: QueuedSkill[]) {
    this.attributes = attributes;
    this.portraits = portraits;
    this.skills = skills;
    this.totalSkillPoints = totalSkillPoints;
    this.unallocatedSkillPoints = unallocatedSkillPoints;
    this.skillQueue = skillQueue;
    this.refreshState = RefreshState.upToDate;
    this.refreshDetail = null;
  }

  @action.bound
  public refreshError(state: RefreshState, detail: string) {
    this.refreshState = state;
    this.refreshDetail = detail;
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
