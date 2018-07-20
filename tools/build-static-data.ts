import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs';
import { flatten, chunk, unionBy } from 'lodash';
import * as request from 'request-promise';
import { retryPromise } from '../src/common/retry';

const host = 'https://esi.evetech.net';
const datasource = 'tranquility';
const lang = 'en-us';
const version = 'latest';

const skillsCategory = 16;
const implantCategory = 20;

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

type EveDogmaAttribute = {
  attribute_id: number;
  default_value?: number;
  description?: string;
  display_name?: string;
  high_is_good?: boolean;
  icon_id?: number;
  name?: string;
  published?: boolean;
  stackable?: boolean;
  unit_id?: number;
};

function esiUrl(resource) {
  return `${host}/${version}${resource}/?datasource=${datasource}&language=${lang}`;
}

function esiRequest<T>(resource): Promise<T> {
  return retryPromise((retry, _) => {
    return request.get(esiUrl(resource), { json: true })
      .promise()
      .catch(error => {
        console.error(error);
        return retry(error);
      });
  });
}

class SkillDataBuilder {
  private attributes: EveDogmaAttribute[] = [];
  private groups: EveGroup[] = [];
  private types: EveType[] = [];

  public build(): Promise<void> {
    return this.getSkills()
      .then(({ groups, skills }) => {
        const attributesToFetch = skills.reduce((accum, skill) => {
          accum = unionBy(accum, skill.attributes, 'id');
          return accum;
        }, []).map(attribute => attribute.id);

        return Promise.props({
          attributes: this.getAttributes(attributesToFetch),
          groups,
          skills
        });
      })
      .then(data =>
        new Promise<void>((resolve, reject) => {
          fs.writeFile(
            path.join(__dirname, 'static.json'),
            JSON.stringify(data),
            err => err ? reject(err) : resolve());
        }));
  }

  private getAttributes(attributeIds: number[]): Promise<{}> {
    return this.getDogmaAttributes(attributeIds)
      .then(attributes => attributes.map(attribute => ({
        id: attribute.attribute_id,
        name: attribute.name,
        displayName: attribute.display_name,
        description: attribute.description
      })));
  }

  private getDogmaAttributes(attributeIds: number[]): Promise<EveDogmaAttribute[]> {
    console.log(`Fetching ${attributeIds.length} Dogma attributes...`);

    const batches = chunk(attributeIds, 100);
    return Promise.mapSeries<number[], EveDogmaAttribute[]>(batches, batch => {
      console.log(`Fetching ${batch.length} attributes...`);
      return Promise.mapSeries(batch, id => esiRequest(`/dogma/attributes/${id}`));
    })
      .then(batchResults => flatten(batchResults));
  }

  private getSkills(): Promise<{ groups, skills }> {
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
            graphicId: type.graphic_id,
            attributes: type.dogma_attributes ?
              type.dogma_attributes.map(attribute => ({
                id: attribute.attribute_id,
                value: attribute.value
              })) : []
          }))
        };

        return skills;
      });
  }

  private getSkillCategory(): Promise<EveCategory> {
    return esiRequest(`/universe/categories/${skillsCategory}`);
  }

  private getSkillGroups(category: EveCategory): Promise<EveGroup[]> {
    console.log(`Fetching ${category.groups.length} category groups...`);
    return Promise.all(category.groups.map(group => esiRequest<EveGroup>(`/universe/groups/${group}`)))
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
