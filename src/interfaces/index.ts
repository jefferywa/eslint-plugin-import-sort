export type SortMethod = 'length' | 'alphabetical';
export type LengthTarget = 'from' | 'full';

export interface ImportGroup {
  pattern: string;
  sortMethod?: SortMethod;
  lengthTarget?: LengthTarget;
  priority?: number;
}

export interface RuleOptions {
  groups: ImportGroup[];
}

export interface LengthRuleOptions {
  lengthTarget?: LengthTarget;
}

export interface GroupRuleOptions {
  groups?: ImportGroup[];
}

export interface CombinedRuleOptions extends RuleOptions {}
