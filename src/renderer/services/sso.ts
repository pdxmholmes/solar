import { shell, ipcRenderer } from 'electron';
import * as uuid from 'uuid';
import * as querystring from 'querystring';
import * as request from 'request-promise';

import {
  rootStore,
  RefreshState,
  Character
} from '../models';

import { messages } from '../../common';
import { esiService } from './esi';

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

interface SsoState {
  session: string;
  characterId?: number;
}

class SsoService {
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

  public refreshToken(character: Character) {
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
      .then(({refresh_token: refreshToken, access_token: accessToken}) => ({
        refreshToken,
        accessToken
      }));
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

        return esiService.refreshCharacter(character, accessToken);
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

export const ssoService = new SsoService();
