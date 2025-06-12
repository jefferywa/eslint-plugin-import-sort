import { TSESTree } from '@typescript-eslint/utils';

export type SortMethod = 'length' | 'alphabetical';
export type LengthTarget = 'from' | 'full';

export interface ImportGroup {
  pattern: string;
  sortMethod?: 'length' | 'alphabetical';
  lengthTarget?: 'from' | 'full';
  priority?: number;
}

export interface RuleOptions {
  groups: ImportGroup[];
}

export interface GroupedImports {
  group: ImportGroup | null;
  imports: TSESTree.ImportDeclaration[];
}

export interface SortedImports {
  sortedImports: TSESTree.ImportDeclaration[];
  groupOrder: (ImportGroup | null)[];
}
