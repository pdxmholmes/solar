import * as Promise from 'bluebird';
global.Promise = Promise;

import * as path from 'path';
import * as fs from 'fs';
import {flatten} from 'lodash';
import * as request from 'request-promise';

const host = 'https://esi.evetech.net';
const datasource = 'tranquility';
const lang = 'en-us';
const version = 'latest';

const skillsCategory = 16;

type EveCategory = {
  category_id: number;
  groups: number[];
  name: string;
  published: boolean
};

type EveGroup = {
  category_id: number;
  group_id: number;
  name: string;
  published: boolean;
  types: number[];
};

type EveType = {
  capacity?: number;
  description: string;
  dogma_attributes?: [{
    attribute_id: number,
    value: number
  }];
  dogma_effects?: [{
    effect_id: number,
    is_default: boolean
  }];
  graphic_id?: number;
  group_id: number;
  icon_id?: number;
  mass?: number;
  name: string;
  package_volume?: number;
  portion_size?: number;
  published: boolean;
  radius?: number;
  type_id: number;
  volume?: number;
};

function esiUrl(resource) {
  return `${host}/${version}${resource}/?datasource=${datasource}&language=${lang}`;
}

class SkillDataBuilder {
  private groups: EveGroup[] = [];
  private types: EveType[] = [];

  public build(): Promise<void> {
    return this.getSkillCategory()
      .then(category => this.getSkillGroups(category))
      .then(groups => this.groups = groups)
      .then(groups => this.getSkillTypes(groups))
      .then(types => this.types = types)
      .then(() => {
        const skills = {
          groups: this.groups.map(group => ({
            id: group.group_id,
            name: group.name
          })),
          skills: this.types.map(type => ({
            id: type.type_id,
            name: type.name,
            description: type.description,
            groupId: type.group_id,
            iconId: type.icon_id,
            graphicId: type.graphic_id
          }))
        };

        return new Promise<void>((resolve, reject) => {
          fs.writeFile(
            path.join(__dirname, 'skills.json'),
            JSON.stringify(skills),
            err => err ? reject(err) : resolve());
        });
      });
  }

  private getSkillCategory(): Promise<EveCategory>  {
    return request.get(esiUrl(`/universe/categories/${skillsCategory}`), {
      json: true
    }).promise();
  }

  private getSkillGroups(category: EveCategory): Promise<EveGroup[]> {
    console.log(`Fetching ${category.groups.length} category groups...`);
    return Promise.all(category.groups.map(group =>
      request.get(esiUrl(`/universe/groups/${group}`), {
        json: true
      })))
    .then(groups => flatten(groups));
  }

  private getSkillTypes(groups: EveGroup[]): Promise<EveType[]> {
    return Promise.mapSeries(groups, this.getGroupTypes)
      .then(types => flatten(types));
  }

  private getGroupTypes(group: EveGroup): Promise<EveType[]> {
    console.log(`Fetching ${group.types.length} skill types...`);
    return Promise.mapSeries(group.types, typeId => request.get(esiUrl(`/universe/types/${typeId}`), {
      json: true
    }));
  }
}

(new SkillDataBuilder()).build()
  .then(() => console.log('Skill data written'));
