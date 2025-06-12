import { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { ImportGroup } from '../interfaces';

import { getImportGroup } from '../utils/group';

export interface Options {
  groups: ImportGroup[];
}

const rule: TSESLint.RuleModule<'ungrouped', [Options]> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Group imports by pattern.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pattern: { type: 'string' },
                sortMethod: {
                  type: 'string',
                  enum: ['length', 'alphabetical'],
                },
                lengthTarget: {
                  type: 'string',
                  enum: ['from', 'full'],
                },
              },
              required: ['pattern'],
            },
          },
        },
        required: ['groups'],
      },
    ],
    messages: {
      ungrouped: 'Imports are not grouped according to the specified patterns.',
    },
  },
  defaultOptions: [{ groups: [] }],
  create(context: TSESLint.RuleContext<'ungrouped', [Options]>) {
    const options = context.options[0];
    const sourceCode = context.getSourceCode();
    return {
      Program(node: TSESTree.Program) {
        const imports = node.body.filter(
          (n): n is TSESTree.ImportDeclaration => n.type === 'ImportDeclaration'
        );
        if (imports.length <= 1) return;

        const groupMap = new Map<string, TSESTree.ImportDeclaration[]>();
        imports.forEach((imp) => {
          const group =
            getImportGroup(imp.source.value as string, options.groups) || null;
          const key = group ? group.pattern : '__default__';
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push(imp);
        });

        const ordered: TSESTree.ImportDeclaration[] = [];
        options.groups.forEach((group) => {
          const arr = groupMap.get(group.pattern);
          if (arr) ordered.push(...arr);
        });
        if (groupMap.get('__default__')) {
          ordered.push(...groupMap.get('__default__')!);
        }

        let isGrouped = true;
        for (let i = 0; i < imports.length; i++) {
          if (imports[i] !== ordered[i]) {
            isGrouped = false;
            break;
          }
        }
        if (!isGrouped) {
          context.report({
            node: imports[0],
            messageId: 'ungrouped',
            fix(fixer: TSESLint.RuleFixer) {
              const grouped: TSESTree.ImportDeclaration[][] = [];
              let lastGroup: ImportGroup | null = null;
              let current: TSESTree.ImportDeclaration[] = [];

              ordered.forEach((imp) => {
                const group =
                  getImportGroup(imp.source.value as string, options.groups) ||
                  null;
                if (group !== lastGroup) {
                  if (current.length) grouped.push(current);
                  current = [];
                  lastGroup = group;
                }
                current.push(imp);
              });
              if (current.length) grouped.push(current);

              // Sort imports within each group according to their sortMethod
              grouped.forEach((group) => {
                const groupConfig = getImportGroup(
                  group[0].source.value as string,
                  options.groups
                );
                if (groupConfig?.sortMethod === 'length') {
                  group.sort((a, b) => {
                    if (groupConfig.lengthTarget === 'full') {
                      const aFull = sourceCode.getText(a);
                      const bFull = sourceCode.getText(b);
                      return aFull.length - bFull.length;
                    } else {
                      const aPath = (a.source.value as string) || '';
                      const bPath = (b.source.value as string) || '';
                      return aPath.length - bPath.length;
                    }
                  });
                } else {
                  // Default to alphabetical sorting
                  group.sort((a, b) => {
                    const aPath = (a.source.value as string) || '';
                    const bPath = (b.source.value as string) || '';
                    return aPath.localeCompare(bPath);
                  });
                }
              });

              const newText = grouped
                .map((groupArr) =>
                  groupArr.map((imp) => sourceCode.getText(imp)).join('\n')
                )
                .join('\n\n');

              return fixer.replaceTextRange(
                [imports[0].range[0], imports[imports.length - 1].range[1]],
                newText
              );
            },
          });
        }
      },
    };
  },
};

export default rule;
