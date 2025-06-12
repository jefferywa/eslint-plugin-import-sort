import { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { sortImports } from '../utils/sorter';
import { getImportGroup } from '../utils/group';

import { ruleSchema, defaultOptions } from '../config';

import { RuleOptions, ImportGroup } from '../interfaces';

const rule: TSESLint.RuleModule<'unsorted' | 'missingNewline', [RuleOptions]> =
  {
    defaultOptions: [defaultOptions],
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Sort imports by length and/or alphabetically within groups.',
      },
      fixable: 'code',
      schema: ruleSchema,
      messages: {
        unsorted: 'Imports are not properly sorted',
        missingNewline: 'Missing newline between import groups',
      },
    },
    create(
      context: TSESLint.RuleContext<
        'unsorted' | 'missingNewline',
        [RuleOptions]
      >
    ) {
      const options = context.options[0];
      const sourceCode = context.sourceCode;

      return {
        Program(node: TSESTree.Program) {
          const imports = node.body.filter(
            (node): node is TSESTree.ImportDeclaration =>
              node.type === 'ImportDeclaration'
          );

          if (imports.length <= 1) return;

          const { sortedImports } = sortImports(
            imports,
            options.groups,
            sourceCode
          );

          for (let i = 1; i < imports.length; i++) {
            const prevGroup = getImportGroup(
              imports[i - 1].source.value as string,
              options.groups
            );
            const currGroup = getImportGroup(
              imports[i].source.value as string,
              options.groups
            );

            if (prevGroup !== currGroup) {
              const textBetween = sourceCode.text.slice(
                imports[i - 1].range[1],
                imports[i].range[0]
              );
              const lineBreaks = textBetween.match(/\n/g)?.length || 0;

              if (lineBreaks !== 2) {
                context.report({
                  node: imports[i],
                  messageId: 'missingNewline',
                  fix(fixer: TSESLint.RuleFixer) {
                    return fixer.replaceTextRange(
                      [imports[i - 1].range[1], imports[i].range[0]],
                      '\n\n'
                    );
                  },
                });
              }
            }
          }

          let isSorted = true;
          for (let i = 0; i < imports.length; i++) {
            if (imports[i] !== sortedImports[i]) {
              isSorted = false;
              break;
            }
          }

          if (!isSorted) {
            context.report({
              node: imports[0],
              messageId: 'unsorted',
              fix(fixer) {
                const grouped: TSESTree.ImportDeclaration[][] = [];
                let lastGroup: ImportGroup | null = null;
                let current: TSESTree.ImportDeclaration[] = [];

                sortedImports.forEach((imp) => {
                  const group =
                    getImportGroup(
                      imp.source.value as string,
                      options.groups
                    ) || null;
                  if (group !== lastGroup) {
                    if (current.length) grouped.push(current);
                    current = [];
                    lastGroup = group;
                  }
                  current.push(imp);
                });
                if (current.length) grouped.push(current);

                const newText = grouped
                  .map((groupArr) =>
                    groupArr.map((imp) => sourceCode.getText(imp)).join('\n')
                  )
                  .join('\n\n');

                const firstImport = imports[0];
                const lastImport = imports[imports.length - 1];
                return fixer.replaceTextRange(
                  [firstImport.range[0], lastImport.range[1]],
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
