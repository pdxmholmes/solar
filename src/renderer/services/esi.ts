import { shell, ipcRenderer } from 'electron';
import * as querystring from 'querystring';
import * as request from 'request-promise';
import * as uuid from 'uuid';
import { rootStore, RefreshState, Character } from '../models';
import { storageService } from '.';

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
    ipcRenderer.on('sso:received-auth-code', this.receiveAuthCode.bind(this));
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

  private receiveAuthCode(_, {code, state}) {
    if (!code || !state) {
      return;
    }

    const activeSession = this.sessions.find(session => session === state);
    if (!activeSession) {
      console.error(`Could not find active session: ${state}`);
      return;
    }

    const authorization =
      Buffer.from(`${rootStore.configuration.clientId}:${rootStore.configuration.clientSecret}`)
      .toString('base64');

    request.post(authorizeUrl, {
      headers: {
        authorization: `Basic ${authorization}`
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
}

export const esiService = new EsiService();