import * as Promise from 'bluebird';
import * as path from 'path';
import { asyncFs } from '../src/common/fs';
import { flatten, omit, sumBy } from 'lodash';
import * as request from 'request-promise';
import { retryPromise } from '../src/common/retry';
import * as pg from 'pg-promise';

const pgp = pg({
  promiseLib: Promise
});

const db = pgp({
  host: '0.0.0.0',
  port: 45432,
  database: 'eve',
  user: 'yaml',
  password: 'eve'
});

const skillsCategory = 16;
const implantCategory = 20;

const selectGroupsSql = `
SELECT
  "groupID" AS id,
  "groupName" AS name
FROM
  evesde."invGroups"
WHERE
  "categoryID" = $[categoryId] AND
  published = true
`;

const selectGroupTypesSql = `
SELECT
  "typeID" AS id,
  "typeName" AS name,
  description,
  "basePrice",
  "iconID" AS "iconId",
  "graphicID" AS "graphicId"
FROM
  evesde."invTypes"
WHERE
  "groupID" = $[groupId] AND
  published = true
`;

const selectTypeAttributesSql = `
SELECT
  "attributeID" AS id,
  "valueInt",
  "valueFloat"
FROM
  evesde."dgmTypeAttributes"
WHERE
  "typeID" = $[typeId]
`;

const selectAttributesSql = `
SELECT
  "attributeID" AS id,
  "attributeName" AS name,
  description,
  "iconID" AS "iconId",
  "defaultValue",
  "displayName"
FROM
  evesde."dgmAttributeTypes"
WHERE
  "attributeID" = ANY($[attributeIds]::int[])
`;

const selectCompleteSkillSql = `
WITH skill_groups AS(
  SELECT
    "groupID" AS id,
    "groupName" AS name
  FROM
    evesde."invGroups"
  WHERE
    "categoryID" = 16 AND
    published = true
)
SELECT
  sg.id AS "groupId",
  sg.name AS "groupName",
  it."typeID" AS id,
  it."typeName" AS name,
  description,
  it."basePrice",
  it."iconID" AS "iconId",
  it."graphicID" AS "graphicId",
  ARRAY(
    SELECT
      jsonb_build_object(
        'skill', rit."typeName",
        'level', (
           SELECT COALESCE("valueInt", "valueFloat")::int
           FROM evesde."dgmTypeAttributes"
           WHERE
             "typeID" = it."typeID" AND
             "attributeID" = (
               SELECT "attributeID"
               FROM evesde."dgmAttributeTypes"
               WHERE
                 "attributeName" = (
                    SELECT "attributeName"
                    FROM evesde."dgmAttributeTypes"
                    WHERE "attributeID" = ta."attributeID") || 'Level')))
    FROM
      evesde."dgmTypeAttributes" AS ta
      INNER JOIN evesde."invTypes" AS rit ON rit."typeID" = COALESCE(ta."valueInt", ta."valueFloat")
    WHERE
      ta."typeID" = it."typeID" AND
      ta."attributeID" IN (
        SELECT "attributeID" FROM evesde."dgmAttributeTypes"
        WHERE "attributeName" IN (
          'requiredSkill1', 'requiredSkill2', 'requiredSkill3',
          'requiredSkill4', 'requiredSkill5', 'requiredSkill6'
        )
      )
  ) AS "requiredSkills",
  jsonb_build_object(
    'primary', (SELECT
      atp."attributeName"
    FROM
      evesde."dgmTypeAttributes" AS ta
      INNER JOIN evesde."dgmAttributeTypes" AS at ON at."attributeID" = ta."attributeID"
      INNER JOIN evesde."dgmAttributeTypes" AS atp ON atp."attributeID" = COALESCE(ta."valueInt", ta."valueFloat")
    WHERE
      "typeID" = it."typeID" AND
      at."attributeName" = 'primaryAttribute'),
    'secondary', (SELECT
      atp."attributeName"
    FROM
      evesde."dgmTypeAttributes" AS ta
      INNER JOIN evesde."dgmAttributeTypes" AS at ON at."attributeID" = ta."attributeID"
      INNER JOIN evesde."dgmAttributeTypes" AS atp ON atp."attributeID" = COALESCE(ta."valueInt", ta."valueFloat")
    WHERE
      "typeID" = it."typeID" AND
      at."attributeName" = 'secondaryAttribute'),
    'rank', (SELECT
      COALESCE(ta."valueInt", ta."valueFloat")
    FROM
      evesde."dgmTypeAttributes" AS ta
      INNER JOIN evesde."dgmAttributeTypes" AS at ON at."attributeID" = ta."attributeID"
    WHERE
      "typeID" = it."typeID" AND
      at."attributeName" = 'skillTimeConstant')
  ) AS attributes
FROM
  skill_groups AS sg
  INNER JOIN evesde."invTypes" AS it ON it."groupID" = sg.id
WHERE
  it.published = true;
`;

function getSpForLevelAndRank(level: number, rank: number) {
  return Math.floor(
    250 *
    rank *
    Math.pow(Math.sqrt(32), level - 1)
  );
}

function getCategoryTypes(categoryId: number) {
  return db.any(selectGroupsSql, {categoryId})
    .then(groups => Promise.props({
      groups,
      typeGraph: Promise.map(groups,
        group => db.any(selectGroupTypesSql, {groupId: group.id})
          .then(types => Promise.map(types, type => Promise.props({
            ...type,
            attributes: db.any(selectTypeAttributesSql, {typeId: type.id})
                          .then(attributes => attributes.map(attribute => ({
                            id: attribute.id,
                            value: attribute.valueFloat || attribute.valueInt
                          })))
          }))))
    }));
}

function buildSpTable() {
  const maxRank = 20;
  const maxLevel = 5;
  const table = {};

  for (let rank = 1; rank <= maxRank; rank++) {
    table[rank] = {};
    for (let level = 1; level <= maxLevel; level++) {
      table[rank][level] = getSpForLevelAndRank(level, rank);
    }

    table[rank].total = 0;
    for (let level = 1; level <= maxLevel; level++) {
      table[rank].total += table[rank][level];
    }
  }

  return Promise.resolve(table);
}

function buildSkills() {
  return db.any(selectCompleteSkillSql)
    .then(skills => (skills.reduce((accum, skill) => {
      const existingGroup = accum.groups.find(group => group.id === skill.groupId);
      if (!existingGroup) {
        accum.groups.push({
          id: skill.groupId,
          name: skill.groupName,
          primaryAttribute: skill.attributes.primary,
          secondaryAttribute: skill.attributes.secondary
        });
      }

      accum.skills.push({
        ...omit(skill, 'groupName', 'attributes'),
        rank: skill.attributes.rank,
        requiredSkills: (skill.requiredSkills || []).reduce((reqAccum, reqSkill) => {
          reqAccum[reqSkill.skill] = reqSkill.level;
          return reqAccum;
        }, {})
      });
      return accum;
    }, {
      groups: [],
      skills: []
    })));
}

function buildImplants() {
  return getCategoryTypes(implantCategory)
    .then(context => ({
      groups: context.groups,
      types: flatten(context.typeGraph)
    }));
}

Promise.all([
  buildSpTable(),
  buildSkills(),
  buildImplants()
])
  .then(([spTable, skills, implants]) => {
   /*let attributes = skills.types.reduce((accum, skill) => {
      accum = unionBy(accum, skill.attributes, 'id');
      return accum;
    }, []);

    attributes = unionBy(attributes, implants.types.reduce((accum, attr) => {
      accum = unionBy(accum, attr.attributes, 'id');
      return accum;
    }, []), 'id');

    return Promise.props({
      skills,
      implants,
      attributes: db.any(selectAttributesSql, {attributeIds: attributes.map(attr => attr.id)})
    });*/
    return Promise.resolve({spTable, skills, implants, attributes: {}});
  })
  .then(({spTable, skills, implants, attributes}) => Promise.all([
    asyncFs.writeFileAsync(path.join(__dirname, '../static/sptable.json'), JSON.stringify(spTable, null, 2)),
    asyncFs.writeFileAsync(path.join(__dirname, '../static/skills.json'), JSON.stringify(skills, null, 2)),
    asyncFs.writeFileAsync(path.join(__dirname, '../static/implants.json'), JSON.stringify(implants)),
    asyncFs.writeFileAsync(path.join(__dirname, '../static/attributes.json'), JSON.stringify(attributes))
  ]))
  .finally(db.$pool.end);

/*const host = 'https://esi.evetech.net';
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
*/
