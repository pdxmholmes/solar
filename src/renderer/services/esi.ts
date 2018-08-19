import * as Promise from 'bluebird';
import * as request from 'request-promise';
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
import { ssoService } from './sso';

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

class EsiService {
  public refreshCharacter(character: Character, accessToken?: string): Promise<Character> {
    const getAccessToken = accessToken
      ? Promise.resolve({refreshToken: character.refreshToken, accessToken})
      : ssoService.refreshToken(character);

    return getAccessToken
      .then(({refreshToken, accessToken: newAccessToken}) => {
        character.beginRefresh(refreshToken, newAccessToken);
        return Promise.all([
          this.getAttributes(character),
          this.getPortraits(character),
          this.getSkills(character),
          this.getSkillQueue(character)
        ]).then(([attributes, portraits, skillResponse, skillQueue]) => {
          character.finalizeRefresh(attributes, portraits, skillResponse.skills,
            skillResponse.totalSkillPoints, skillResponse.unallocatedSkillPoints, skillQueue);

          rootStore.addCharacter(character);
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
}

export const esiService = new EsiService();
