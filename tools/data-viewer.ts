import * as Yargs from 'yargs';
import * as colors from 'colors';
import * as pad from 'pad';
import { StaticSkills } from '../src/common/static';

const attributes = require('../static/attributes.json');
const skillData = require('../static/skills.json') as StaticSkills;
const implants = require('../static/implants.json');

// tslint:disable:no-unused-expression
Yargs.command({
  command: 'skill <name>',
  describe: 'view a skill',
  handler: argv => viewSkill(argv.name)
})
  .demandCommand()
  .help()
  .argv;
// tslint:enable:no-unused-expression

function getRequiredSkills(skillName) {
  const skill = skillData.skills.find(s => s.name === skillName);
  const requiredSkillNames = Object.keys(skill.requiredSkills);
  return requiredSkillNames.map(name => ({
    skill: name,
    level: skill.requiredSkills[name],
    requiredSkills: getRequiredSkills(name)
  }));
}

function printRequiredSkills(requiredSkills: any[], level: number) {
  if (requiredSkills.length < 1) {
    return '';
  }

  const basePadding = 5;
  return `${level > 0 ? '\n' : ''}${requiredSkills.map(reqSkill => {
    const text = `${' '.repeat(basePadding * level)}${reqSkill.skill}: ${reqSkill.level}`;
    const subText = printRequiredSkills(reqSkill.requiredSkills, level + 1);
    return `${text}${subText}`;
  }).join('\n')}`;
}

function getTotalSp(skill) {
  return Math.floor(
    250 *
    skill.trainingMultiplier *
    Math.pow(Math.sqrt(32), 4)
  ).toLocaleString('en-US');
}

function viewSkill(name: string) {
  const nameRegex = new RegExp(`^${name}.*$`, 'i');
  const skill = skillData.skills.find(type => nameRegex.test(type.name));
  if (!skill) {
    console.error(colors.red(`Could not find skill '${name}'`));
    return 1;
  }

  const group = skillData.groups.find(g => g.id === skill.groupId);

  console.log(colors.underline.cyan(`${skill.name} (${skill.id})`));
  console.log(skill.description);

  console.log();

  console.log(`${colors.white('Group:')} ${group.name} (${group.id})`);
  console.log(`${colors.white('Attributes:')} ${group.primaryAttribute}, ${group.secondaryAttribute}`);
  console.log(`${colors.white('Base Price:')} ${skill.basePrice}`);
  console.log(`${colors.white('Rank:')} ${skill.rank}`);
  console.log(`${colors.white('Total SP:')} ${getTotalSp(skill)}`);

  console.log();

  console.log(colors.bold.white('Required skills:'));

  const requiredSkills = getRequiredSkills(skill.name);
  console.log(printRequiredSkills(requiredSkills, 0));

  return 0;
}
