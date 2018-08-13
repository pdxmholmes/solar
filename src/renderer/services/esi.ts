import * as Promise from 'bluebird';
import { shell, ipcRenderer } from 'electron';
import * as querystring from 'querystring';
import * as request from 'request-promise';
import * as uuid from 'uuid';
import {
  rootStore,
  RefreshState,
  Character,
  Skill,
  QueuedSkill,
  CharacterAttributes,
  CharacterPortraits
} from '../models';
import { storageService } from '.';
import { messages } from '../../common';

const isDevelopment = process.env.NODE_ENV !== 'production';

const callbackUrl = isDevelopment ? 'http://localhost:9999' : 'eveauth-solar://callback';
const loginUrl = 'https://login.eveonline.com/oauth/authorize';
const authorizeUrl = 'https://login.eveonline.com/oauth/token';
const characterVerifyUrl = 'https://esi.tech.ccp.is/verify/';
const scopes = [
  'publicData',
  'esi-skills.read_skills.v1',
  'esi-skills.read_skillqueue.v1',
  'esi-clones.read_clones.v1',
  'esi-clones.read_implants.v1'
];

const refreshErrors = [
  {
    statusCode: 400,
    error: 'invalid_token',
    refreshState: RefreshState.invalidToken,
    refreshDetail: 'ESI authentication expired. Character needs to re-authenticate'
  }
];

interface SkillResponse {
  skills: Skill[];
  totalSkillPoints: number;
  unallocatedSkillPoints: number;
}

interface SsoState {
  session: string;
  characterId?: number;
}

class EsiService {
  private sessions: string[] = [];

  constructor() {
    ipcRenderer.on(messages.sso.receivedAuthCode, this.receiveAuthCode.bind(this));
  }

  public authenticateCharacter(characterId?: number) {
    const state = {
      session: uuid.v4(),
      characterId
    };

    const params = {
      response_type: 'code',
      redirect_uri: callbackUrl,
      client_id: rootStore.configuration.clientId,
      scope: scopes.join(' '),
      state: this.encodeState(state)
    };

    this.sessions.push(state.session);

    shell.openExternal(`${loginUrl}?${querystring.stringify(params)}`);
  }

  public refreshCharacter(character: Character): Promise<Character> {
    return request.post(authorizeUrl, {
      headers: {
        authorization: `Basic ${this.getAuthorization()}`
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: character.refreshToken
      },
      json: true
    })
      .then(response => {
        character.beginRefresh(response.refresh_token, response.access_token);
        return Promise.all([
          this.getAttributes(character),
          this.getPortraits(character),
          this.getSkills(character),
          this.getSkillQueue(character)
        ]).then(([attributes, portraits, skillResponse, skillQueue]) => {
          character.finalizeRefresh(attributes, portraits, skillResponse.skills,
            skillResponse.totalSkillPoints, skillResponse.unallocatedSkillPoints, skillQueue);
        })
          .then(() => character);
      })
      .catch(e => {
        let refreshState: RefreshState = null;
        let refreshDetail: string = null;
        const refreshError =
          refreshErrors.find(re => re.statusCode === e.statusCode && re.error === e.error.error);
        if (refreshError) {
          refreshState = refreshError.refreshState;
          refreshDetail = refreshError.refreshDetail;
        } else {
          refreshState = RefreshState.error;
          refreshDetail = e.message;
        }

        character.refreshError(refreshState, refreshDetail);
        return character;
      })
      .finally(() => storageService.save<Character>(`character-${character.id.toString()}`, character));
  }

  public getSkills(character: Character): Promise<SkillResponse> {
    return request.get(`https://esi.evetech.net/latest/characters/${character.id}/skills`, {
      headers: {
        authorization: `Bearer ${character.accessToken}`
      },
      json: true
    })
      .then(({ skills, total_sp, unallocated_sp }) => {
        return {
          skills: skills.map(skill =>
            new Skill(
              skill.skill_id,
              skill.active_skill_level,
              skill.trained_skill_level)),
          totalSkillPoints: total_sp,
          unallocatedSkillPoints: unallocated_sp || 0
        };
      });
  }

  public getSkillQueue(character: Character): Promise<QueuedSkill[]> {
    return request.get(`https://esi.evetech.net/latest/characters/${character.id}/skillqueue`, {
      headers: {
        authorization: `Bearer ${character.accessToken}`
      },
      json: true
    })
      .then(queue => {
        return queue.map(skill => new QueuedSkill(
          skill.finish_date ? new Date(skill.finish_date) : null,
          skill.finished_level,
          skill.level_start_sp,
          skill.level_end_sp,
          skill.queue_position,
          skill.skill_id,
          skill.start_date ? new Date(skill.start_date) : null,
          skill.training_start_sp
        ));
      });
  }

  public getPortraits(character: Character): Promise<CharacterPortraits> {
    return request.get(`https://esi.evetech.net/latest/characters/${character.id}/portrait`, {
      json: true
    })
      .then(portraits => {
        return {
          px64: portraits.px64x64,
          px128: portraits.px128x128,
          px256: portraits.px256x256,
          px512: portraits.px512x512
        };
      });
  }

  public getAttributes(character: Character): Promise<CharacterAttributes> {
    return request.get(`https://esi.evetech.net/latest/characters/${character.id}/attributes`, {
      headers: {
        authorization: `Bearer ${character.accessToken}`
      },
      json: true
    })
      .then(attributes => {
        return new CharacterAttributes(attributes);
      });
  }

  private receiveAuthCode(_, { code, state }) {
    if (!code || !state) {
      return;
    }

    const { session, characterId } = this.decodeState(state);
    const activeSession = this.sessions.find(s => s === session);
    if (!activeSession) {
      return Promise.reject(`Could not find active session: ${state}`);
    }

    request.post(authorizeUrl, {
      headers: {
        authorization: `Basic ${this.getAuthorization()}`
      },
      form: {
        grant_type: 'authorization_code',
        code
      },
      json: true
    })
      .then(response =>
        this.verifyCharacter(
          response.access_token,
          response.refresh_token,
          response.access_token,
          characterId
        ))
      .catch(err => console.error(err));
  }

  private verifyCharacter(bearerToken: string, refreshToken: string, accessToken: string, characterId?: number) {
    return request.get(characterVerifyUrl, {
      headers: {
        authorization: `Bearer ${bearerToken}`
      },
      json: true
    })
      .then(response => {
        let character: Character = null;
        if (characterId) {
          if (characterId !== response.CharacterID) {
            return Promise.reject('Character ID\'s don\'t match. Please use Add Character to add new characters.');
          }

          character = rootStore.characters.find(c => c.id === characterId);
          character.beginRefresh(refreshToken, accessToken);
        } else {
          character = new Character({
            id: response.CharacterID,
            name: response.CharacterName,
            refreshToken,
            refreshState: RefreshState.refreshing
          }, accessToken);
        }

        return Promise.all([
          this.getAttributes(character),
          this.getPortraits(character),
          this.getSkills(character),
          this.getSkillQueue(character)
        ])
          .then(([attributes, portraits, skillResponse, skillQueue]) => {
            character.finalizeRefresh(attributes, portraits, skillResponse.skills,
              skillResponse.totalSkillPoints, skillResponse.unallocatedSkillPoints, skillQueue);

            rootStore.addCharacter(character);
            return storageService.save<Character>(`character-${character.id.toString()}`, character);
          });
      });
  }

  private getAuthorization(): string {
    return Buffer.from(`${rootStore.configuration.clientId}:${rootStore.configuration.clientSecret}`)
      .toString('base64');
  }

  private encodeState(state: SsoState) {
    return Buffer.from(JSON.stringify(state)).toString('base64');
  }

  private decodeState(state: string): SsoState {
    return JSON.parse(Buffer.from(state, 'base64').toString('utf8')) as SsoState;
  }
}

export const esiService = new EsiService();
