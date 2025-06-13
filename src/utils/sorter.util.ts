import { TSESTree, TSESLint } from '@typescript-eslint/utils';
import { ImportGroup, LengthTarget, RuleOptions } from '../interfaces/index';
import { getImportGroup, sortGroupsByPriority } from './group.util';
import {
  DEFAULTS,
  LENGTH_TARGET,
  SORT_METHOD,
  IMPORT_PATTERNS,
  IMPORT_TYPES,
} from '../constants';

type SortFunction = (
  a: TSESTree.ImportDeclaration,
  b: TSESTree.ImportDeclaration,
  context: TSESLint.RuleContext<
    'unsorted' | 'missingNewline' | 'ungrouped',
    [RuleOptions]
  >
) => number;

export const createAlphabeticalSorter = (
  context: TSESLint.RuleContext<
    'unsorted' | 'missingNewline' | 'ungrouped',
    [RuleOptions]
  >
): SortFunction => {
  return (a, b) => {
    const aPath = (a.source.value as string).toLowerCase();
    const bPath = (b.source.value as string).toLowerCase();
    return aPath.localeCompare(bPath);
  };
};

export const createLengthSorter = (
  context: TSESLint.RuleContext<
    'unsorted' | 'missingNewline' | 'ungrouped',
    [RuleOptions]
  >,
  lengthTarget: LengthTarget
): SortFunction => {
  const sourceCode = context.getSourceCode();
  return (a, b) => {
    if (lengthTarget === LENGTH_TARGET.FULL) {
      return sourceCode.getText(a).length - sourceCode.getText(b).length;
    }
    const aPath = (a.source.value as string) || '';
    const bPath = (b.source.value as string) || '';
    return aPath.length - bPath.length;
  };
};

const getSorter = (
  group: ImportGroup,
  context: TSESLint.RuleContext<
    'unsorted' | 'missingNewline' | 'ungrouped',
    [RuleOptions]
  >
): SortFunction => {
  if (group.sortMethod === SORT_METHOD.ALPHABETICAL) {
    return createAlphabeticalSorter(context);
  }
  return createLengthSorter(
    context,
    group.lengthTarget || DEFAULTS.DEFAULT_LENGTH_TARGET
  );
};

function isExternal(importPath: string): boolean {
  return /^[^./]/.test(importPath);
}

function classifyExternal(importPath: string): number {
  if (IMPORT_PATTERNS.NPM.test(importPath)) return IMPORT_TYPES.NPM;
  if (IMPORT_PATTERNS.SCOPED.test(importPath)) return IMPORT_TYPES.SCOPED;
  if (
    IMPORT_PATTERNS.ALIASED.test(importPath) &&
    !IMPORT_PATTERNS.RELATIVE.test(importPath) &&
    !IMPORT_PATTERNS.ABSOLUTE.test(importPath) &&
    !IMPORT_PATTERNS.WINDOWS_ABSOLUTE.test(importPath)
  )
    return IMPORT_TYPES.ALIASED;
  if (
    IMPORT_PATTERNS.ABSOLUTE.test(importPath) ||
    IMPORT_PATTERNS.WINDOWS_ABSOLUTE.test(importPath)
  )
    return IMPORT_TYPES.ABSOLUTE;
  return IMPORT_TYPES.OTHER;
}

export function sortImports(
  imports: TSESTree.ImportDeclaration[],
  groups: ImportGroup[],
  context: TSESLint.RuleContext<
    'unsorted' | 'missingNewline' | 'ungrouped',
    [RuleOptions]
  >
): { sortedImports: TSESTree.ImportDeclaration[] } {
  if (!imports.length) {
    return { sortedImports: [] };
  }

  const sortedGroups = sortGroupsByPriority(groups);
  const importGroups = new Map<string, TSESTree.ImportDeclaration[]>();

  imports.forEach((imp) => {
    const group = getImportGroup(imp.source.value as string, groups);
    const key = group?.pattern ?? DEFAULTS.DEFAULT_GROUP;
    if (!importGroups.has(key)) {
      importGroups.set(key, []);
    }
    importGroups.get(key)!.push(imp);
  });

  const sortedImports: TSESTree.ImportDeclaration[] = [];

  sortedGroups.forEach((group) => {
    const groupImports = importGroups.get(group.pattern);
    if (groupImports?.length) {
      const sorter = getSorter(group, context);
      groupImports.sort((a, b) => sorter(a, b, context));
      sortedImports.push(...groupImports);
    }
  });

  const defaultGroup = importGroups.get(DEFAULTS.DEFAULT_GROUP);
  if (defaultGroup?.length) {
    defaultGroup.sort((a, b) =>
      (a.source.value as string)
        .toLowerCase()
        .localeCompare((b.source.value as string).toLowerCase())
    );
    sortedImports.push(...defaultGroup);
  }

  return { sortedImports };
}
