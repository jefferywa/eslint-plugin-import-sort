import { TSESTree } from '@typescript-eslint/utils';
import { TSESLint } from '@typescript-eslint/utils';
import { ImportGroup } from '../interfaces/index';
import { getImportGroup, sortGroupsByPriority } from './group';

interface SortResult {
  sortedImports: TSESTree.ImportDeclaration[];
}

export function sortImports(
  imports: TSESTree.ImportDeclaration[],
  groups: ImportGroup[],
  sourceCode: TSESLint.SourceCode
): SortResult {
  const sortedGroups = sortGroupsByPriority(groups);

  const groupMap = new Map<string, ImportGroup>();
  sortedGroups.forEach((group) => {
    groupMap.set(group.pattern, group);
  });

  const importGroups = new Map<string, TSESTree.ImportDeclaration[]>();
  imports.forEach((imp) => {
    const group = getImportGroup(imp.source.value as string, groups) || null;
    const key = group ? group.pattern : '__default__';
    if (!importGroups.has(key)) importGroups.set(key, []);
    importGroups.get(key)!.push(imp);
  });

  const sortedImports: TSESTree.ImportDeclaration[] = [];

  sortedGroups.forEach((group) => {
    const arr = importGroups.get(group.pattern);
    if (arr) {
      if (group.sortMethod === 'alphabetical') {
        arr.sort((a, b) => {
          const aPath = sourceCode.getText(a).toLowerCase();
          const bPath = sourceCode.getText(b).toLowerCase();
          return aPath.localeCompare(bPath);
        });
      } else if (group.sortMethod === 'length') {
        arr.sort((a, b) => {
          if (group.lengthTarget === 'full') {
            return sourceCode.getText(a).length - sourceCode.getText(b).length;
          } else {
            const aPath = (a.source.value as string) || '';
            const bPath = (b.source.value as string) || '';
            return aPath.length - bPath.length;
          }
        });
      }
      sortedImports.push(...arr);
    }
  });

  if (importGroups.get('__default__')) {
    const defaultGroup = importGroups.get('__default__')!;
    defaultGroup.sort((a, b) => {
      const aPath = a.source.value as string;
      const bPath = b.source.value as string;
      return aPath.length - bPath.length;
    });
    sortedImports.push(...defaultGroup);
  }

  return { sortedImports };
}
