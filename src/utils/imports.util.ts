import { TSESTree, TSESLint } from '@typescript-eslint/utils';
import { ImportGroup } from '../interfaces';

import { getImportGroup } from './group.util';
import { DEFAULTS, LENGTH_TARGET } from '../constants';

export function filterImportDeclarations(
  body: TSESTree.ProgramStatement[]
): TSESTree.ImportDeclaration[] {
  return body.filter(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === 'ImportDeclaration'
  );
}

export function sortImportsByLength(
  imports: TSESTree.ImportDeclaration[],
  sourceCode: TSESLint.SourceCode,
  lengthTarget: (typeof LENGTH_TARGET)[keyof typeof LENGTH_TARGET] = LENGTH_TARGET.FROM
): TSESTree.ImportDeclaration[] {
  return [...imports].sort((a, b) => {
    const aText = sourceCode.getText(a);
    const bText = sourceCode.getText(b);
    const aLength =
      lengthTarget === LENGTH_TARGET.FROM
        ? a.source.value.length
        : aText.length;
    const bLength =
      lengthTarget === LENGTH_TARGET.FROM
        ? b.source.value.length
        : bText.length;
    return aLength - bLength;
  });
}

export function sortImportsAlphabetically(
  imports: TSESTree.ImportDeclaration[]
): TSESTree.ImportDeclaration[] {
  return [...imports].sort((a, b) =>
    a.source.value.localeCompare(b.source.value)
  );
}

export function formatSortedImports(
  sortedImports: TSESTree.ImportDeclaration[],
  groups: ImportGroup[],
  sourceCode: TSESLint.SourceCode
): string {
  const getGroupKey = (importPath: string) => {
    const group = getImportGroup(importPath, groups);
    return group ? group.pattern : DEFAULTS.DEFAULT_GROUP;
  };

  return sortedImports
    .map((node, index) => {
      if (typeof node === 'string' && node === '__BLANK_LINE__') {
        return DEFAULTS.DOUBLE_NEWLINE.trimEnd();
      }
      const currentGroup =
        typeof node !== 'string'
          ? getGroupKey(node.source.value as string)
          : '';
      const nextGroup =
        index < sortedImports.length - 1 &&
        typeof sortedImports[index + 1] !== 'string'
          ? getGroupKey(
              (sortedImports[index + 1] as any).source.value as string
            )
          : null;
      const nodeText = typeof node !== 'string' ? sourceCode.getText(node) : '';
      if (
        nextGroup &&
        currentGroup !== nextGroup &&
        typeof node !== 'string' &&
        typeof sortedImports[index + 1] !== 'string'
      ) {
        return nodeText + DEFAULTS.DOUBLE_NEWLINE;
      }
      return nodeText;
    })
    .join(DEFAULTS.NEWLINE)
    .replace(/(\n){3,}/g, DEFAULTS.DOUBLE_NEWLINE)
    .replace(/(\n\s*)+$/, '');
}
