import { TSESTree } from '@typescript-eslint/utils';
import { TSESLint } from '@typescript-eslint/utils';
import { ImportGroup, SortMethod, LengthTarget } from '../interfaces/index';
import { getImportGroup, sortGroupsByPriority } from './group';

interface SortResult {
  sortedImports: TSESTree.ImportDeclaration[];
}

type SortFunction = (
  a: TSESTree.ImportDeclaration,
  b: TSESTree.ImportDeclaration
) => number;

const createAlphabeticalSorter = (
  sourceCode: TSESLint.SourceCode
): SortFunction => {
  return (a, b) => {
    const aPath = sourceCode.getText(a).toLowerCase();
    const bPath = sourceCode.getText(b).toLowerCase();
    return aPath.localeCompare(bPath);
  };
};

const createLengthSorter = (
  sourceCode: TSESLint.SourceCode,
  lengthTarget: LengthTarget
): SortFunction => {
  return (a, b) => {
    if (lengthTarget === 'full') {
      return sourceCode.getText(a).length - sourceCode.getText(b).length;
    }
    const aPath = (a.source.value as string) || '';
    const bPath = (b.source.value as string) || '';
    return aPath.length - bPath.length;
  };
};

const getSorter = (
  group: ImportGroup,
  sourceCode: TSESLint.SourceCode
): SortFunction => {
  if (group.sortMethod === 'alphabetical') {
    return createAlphabeticalSorter(sourceCode);
  }
  return createLengthSorter(sourceCode, group.lengthTarget || 'from');
};

export function sortImports(
  imports: TSESTree.ImportDeclaration[],
  groups: ImportGroup[],
  sourceCode: TSESLint.SourceCode
): SortResult {
  if (!imports.length) {
    return { sortedImports: [] };
  }

  const sortedGroups = sortGroupsByPriority(groups);
  const importGroups = new Map<string, TSESTree.ImportDeclaration[]>();

  // Группируем импорты
  imports.forEach((imp) => {
    const group = getImportGroup(imp.source.value as string, groups);
    const key = group?.pattern ?? '__default__';
    if (!importGroups.has(key)) {
      importGroups.set(key, []);
    }
    importGroups.get(key)!.push(imp);
  });

  const sortedImports: TSESTree.ImportDeclaration[] = [];

  // Сортируем по группам
  sortedGroups.forEach((group) => {
    const groupImports = importGroups.get(group.pattern);
    if (groupImports?.length) {
      const sorter = getSorter(group, sourceCode);
      groupImports.sort(sorter);
      sortedImports.push(...groupImports);
    }
  });

  // Сортируем импорты без группы
  const defaultGroup = importGroups.get('__default__');
  if (defaultGroup?.length) {
    const defaultSorter = createLengthSorter(sourceCode, 'from');
    defaultGroup.sort(defaultSorter);
    sortedImports.push(...defaultGroup);
  }

  return { sortedImports };
}
