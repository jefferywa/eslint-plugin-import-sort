import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  RULE_TYPE,
  MESSAGES,
  DESCRIPTIONS,
  LENGTH_TARGET,
  NODE_TYPES,
} from '../constants';
import { createLengthSorter } from '../utils/sorter.util';
import { formatSortedImports } from '../utils/imports.util';
import { LengthRuleOptions } from '../interfaces';
import { createRule } from '../utils/rule.util';

const rule = createRule<LengthRuleOptions>({
  name: 'sortLength',
  description: DESCRIPTIONS.LENGTH,
  messages: [{ id: 'unsorted', message: MESSAGES.UNSORTED_LENGTH }],
  schema: [
    {
      type: 'object',
      properties: {
        lengthTarget: {
          type: 'string',
          enum: [LENGTH_TARGET.FROM, LENGTH_TARGET.FULL],
        },
      },
    },
  ],
  defaultOptions: { lengthTarget: LENGTH_TARGET.FROM },
  create: (context, options) => {
    const lengthTarget = options.lengthTarget || LENGTH_TARGET.FROM;
    const sourceCode = context.getSourceCode();

    return {
      Program(node: TSESTree.Program) {
        const imports = node.body.filter(
          (node): node is TSESTree.ImportDeclaration =>
            node.type === NODE_TYPES.IMPORT_DECLARATION
        );

        if (imports.length <= 1) return;

        const validImports = imports.filter(
          (imp) => typeof imp.source.value === 'string'
        );

        if (validImports.length <= 1) return;

        const sorter = createLengthSorter(context as any, lengthTarget);
        const sorted = [...validImports].sort((a, b) =>
          sorter(a, b, context as any)
        );

        let isSorted = true;
        for (let i = 0; i < validImports.length; i++) {
          if (validImports[i] !== sorted[i]) {
            isSorted = false;
            break;
          }
        }

        if (!isSorted) {
          context.report({
            node: validImports[0],
            messageId: 'unsorted',
            fix(fixer: TSESLint.RuleFixer) {
              const newText = formatSortedImports(sorted, [], sourceCode);
              return fixer.replaceTextRange(
                [
                  validImports[0].range[0],
                  validImports[validImports.length - 1].range[1],
                ],
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
