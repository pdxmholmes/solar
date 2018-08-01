export interface SkillPointRank {
  [level: number]: number;
  total: number;
}
export interface SkillPointTable {
  [rank: number]: SkillPointRank;
}
export interface RequiredSkills {
  [skill: string]: number;
}

export interface SkillGroup {
  id: number;
  name: string;
  primaryAttribute: string;
  secondaryAttribute: string;
}

export interface SkillType {
  groupId: number;
  id: number;
  name: string;
  description: string;
  basePrice: string;
  iconId: number;
  graphicId: number;
  requiredSkills: RequiredSkills;
  rank: number;
}

export interface StaticSkills {
  groups: SkillGroup[];
  skills: SkillType[];
}
