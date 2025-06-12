import { TSESTree } from '@typescript-eslint/utils';
import { TSESLint } from '@typescript-eslint/utils';
import { ImportGroup } from '../interfaces/index';
import { getImportGroup } from './group';

interface SortResult {
  sortedImports: TSESTree.ImportDeclaration[];
}

export function sortImports(
  imports: TSESTree.ImportDeclaration[],
  groups: ImportGroup[],
  sourceCode: TSESLint.SourceCode
): SortResult {
  const groupMap = new Map<string, TSESTree.ImportDeclaration[]>();
  imports.forEach((imp) => {
    const group = getImportGroup(imp.source.value as string, groups) || null;
    const key = group ? group.pattern : '__default__';
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(imp);
  });

  const sortedImports: TSESTree.ImportDeclaration[] = [];
  groups.forEach((group) => {
    const arr = groupMap.get(group.pattern);
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

  if (groupMap.get('__default__')) {
    const defaultGroup = groupMap.get('__default__')!;
    defaultGroup.sort((a, b) => {
      const aPath = a.source.value as string;
      const bPath = b.source.value as string;
      return aPath.length - bPath.length;
    });
    sortedImports.push(...defaultGroup);
  }

  return { sortedImports };
}
