import * as Promise from 'bluebird';
import { shell, ipcRenderer } from 'electron';
import * as querystring from 'querystring';
import * as request from 'request-promise';
import * as uuid from 'uuid';
import {
  rootStore,
  RefreshState,
  Character,
  Skill
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

class EsiService {
  private sessions: string[] = [];

  constructor() {
    ipcRenderer.on(messages.sso.receivedAuthCode, this.receiveAuthCode.bind(this));
  }

  public authenticateNewCharacter() {
    const session = Buffer.from(uuid.v4()).toString('base64');
    const params = {
      response_type: 'code',
      redirect_uri: callbackUrl,
      client_id: rootStore.configuration.clientId,
      scope: scopes.join(' '),
      state: session
    };

    this.sessions.push(session);

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
        character.refreshToken = response.refresh_token;
        character.refreshState = RefreshState.upToDate;
        character.accessToken = response.access_token;
        character.refreshDetail = null;
        return Promise.all([
          this.getPortraits(character),
          this.getSkills(character)
        ]).then(() => character);
      })
      .catch((error: Error) => {
        character.refreshState = RefreshState.error;
        character.refreshDetail = error.message;
        return character;
      })
      .finally(() => storageService.save<Character>(`character-${character.id.toString()}`, character));
  }

  public getSkills(character: Character): Promise<Character> {
    return request.get(`https://esi.evetech.net/latest/characters/${character.id}/skills`, {
      headers: {
        authorization: `Bearer ${character.accessToken}`
      },
      json: true
    })
      .then(({skills, total_sp, unallocated_sp}) => {
        character.skills = skills.map(skill => new Skill(
          skill.skill_id,
          skill.active_skill_level,
          skill.trained_skill_level
        ));
        character.totalSkillPoints = total_sp;
        character.unallocatedSkillPoints = unallocated_sp || 0;
        return character;
      });
  }

  public getPortraits(character: Character): Promise<Character> {
    return request.get(`https://esi.evetech.net/latest/characters/${character.id}/portrait`, {
      json: true
    })
      .then(portraits => {
        character.portraits = {
          px64: portraits.px64x64,
          px128: portraits.px128x128,
          px256: portraits.px256x256,
          px512: portraits.px512x512
        };

        return character;
      });
  }

  private receiveAuthCode(_, {code, state}) {
    if (!code || !state) {
      return;
    }

    const activeSession = this.sessions.find(session => session === state);
    if (!activeSession) {
      console.error(`Could not find active session: ${state}`);
      return;
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
      .then(response => this.verifyCharacter(response.access_token, response.refresh_token))
      .catch(err => console.error(err));
  }

  private verifyCharacter(bearerToken: string, refreshToken: string) {
    return request.get(characterVerifyUrl, {
      headers: {
        authorization: `Bearer ${bearerToken}`
      },
      json: true
    })
      .then(response => {
        const character = new Character();
        character.id = response.CharacterID;
        character.name = response.CharacterName;
        character.refreshToken = refreshToken;
        character.refreshState = RefreshState.upToDate;

        rootStore.addCharacter(character);
        return storageService.save<Character>(`character-${character.id.toString()}`, character);
      });
  }

  private getAuthorization(): string {
    return Buffer.from(`${rootStore.configuration.clientId}:${rootStore.configuration.clientSecret}`)
      .toString('base64');
  }
}

export const esiService = new EsiService();
