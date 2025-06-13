import { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { sortImports } from '../utils/sorter.util';
import { getImportGroup } from '../utils/group.util';
import { formatSortedImports } from '../utils/imports.util';

import { ruleSchema, defaultOptions } from '../config/config';
import {
  RULE_TYPE,
  MESSAGES,
  DESCRIPTIONS,
  DEFAULTS,
  NODE_TYPES,
} from '../constants';

import { CombinedRuleOptions } from '../interfaces';
import { createRule } from '../utils/rule.util';

const rule = createRule<CombinedRuleOptions>({
  name: 'sortCombined',
  description: DESCRIPTIONS.COMBINED,
  messages: [
    { id: 'unsorted', message: MESSAGES.UNSORTED },
    { id: 'missingNewline', message: MESSAGES.MISSING_NEWLINE },
  ],
  schema: ruleSchema,
  defaultOptions: defaultOptions,
  create: (
    context: TSESLint.RuleContext<string, [CombinedRuleOptions]>,
    options: CombinedRuleOptions
  ) => {
    const sourceCode = context.getSourceCode();

    return {
      Program(node: TSESTree.Program) {
        const imports = node.body.filter(
          (node): node is TSESTree.ImportDeclaration =>
            node.type === NODE_TYPES.IMPORT_DECLARATION
        );

        if (imports.length <= 1) return;

        const { sortedImports } = sortImports(
          imports,
          options.groups,
          context as any
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
                    DEFAULTS.DOUBLE_NEWLINE
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
            fix(fixer: TSESLint.RuleFixer) {
              const newText = formatSortedImports(
                sortedImports,
                options.groups,
                sourceCode
              );

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
});

export default rule;
