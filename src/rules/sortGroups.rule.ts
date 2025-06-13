import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { NODE_TYPES, MESSAGES, DESCRIPTIONS, RULE_TYPE } from '../constants';
import {
  IMPORT_PATTERNS,
  IMPORT_PRIORITIES,
} from '../constants/imports.constant';
import { SORT_METHOD, LENGTH_TARGET } from '../constants/schema.constant';
import { sortImports } from '../utils/sorter.util';
import { formatSortedImports } from '../utils/imports.util';
import { GroupRuleOptions } from '../interfaces';
import { createRule } from '../utils/rule.util';
import { getImportGroup } from '../utils/group.util';

const rule = createRule<GroupRuleOptions>({
  name: 'sortGroups',
  description: DESCRIPTIONS.GROUPS,
  messages: [{ id: 'ungrouped', message: MESSAGES.UNGROUPED }],
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
              priority: { type: 'number' },
              sortMethod: {
                type: 'string',
                enum: [SORT_METHOD.ALPHABETICAL, SORT_METHOD.LENGTH],
              },
              lengthTarget: {
                type: 'string',
                enum: [LENGTH_TARGET.FROM, LENGTH_TARGET.FULL],
              },
            },
            required: ['pattern'],
          },
        },
      },
    },
  ],
  defaultOptions: { groups: [] },
  create: (context, options) => {
    let groups = options.groups || [];
    if (
      !groups.some(
        (g) =>
          g.pattern === IMPORT_PATTERNS.NON_RELATIVE.toString().slice(1, -1)
      )
    ) {
      groups = [
        {
          pattern: IMPORT_PATTERNS.NON_RELATIVE.toString().slice(1, -1),
          sortMethod: 'alphabetical',
          priority: 0,
        },
        ...groups,
      ];
    }
    const sourceCode = context.getSourceCode();

    return {
      Program(node: TSESTree.Program) {
        const comments = sourceCode.getAllComments();

        const disabledLines = new Set<number>();
        comments.forEach((comment) => {
          if (
            /eslint-disable-next-line\s+import-sort\/import-sort-groups/.test(
              comment.value
            )
          ) {
            disabledLines.add(comment.loc.end.line + 1);
          }
        });

        const imports = node.body.filter(
          (node): node is TSESTree.ImportDeclaration =>
            node.type === NODE_TYPES.IMPORT_DECLARATION
        );

        if (imports.length <= 1) return;

        const importsWithDisable = imports.map((imp) => ({
          imp,
          disabled: disabledLines.has(imp.loc.start.line),
        }));

        if (importsWithDisable.some(({ disabled }) => disabled)) return;
        const validImports = importsWithDisable
          .filter(({ imp }) => typeof imp.source.value === 'string')
          .map(({ imp }) => imp);

        if (validImports.length <= 1) return;

        let isGrouped = true;
        let currentGroup: string | null = null;

        for (let i = 0; i < validImports.length; i++) {
          const imp = validImports[i];
          const isExternal =
            typeof imp.source.value === 'string' &&
            IMPORT_PATTERNS.EXTERNAL.test(imp.source.value);
          const group = getImportGroup(imp.source.value as string, groups);
          const groupPattern = group?.pattern ?? '';
          const priority =
            group?.priority ??
            (isExternal
              ? IMPORT_PRIORITIES.EXTERNAL
              : IMPORT_PRIORITIES.DEFAULT);

          if (i > 0) {
            const prevImp = validImports[i - 1];
            const prevIsExternal =
              typeof prevImp.source.value === 'string' &&
              IMPORT_PATTERNS.EXTERNAL.test(prevImp.source.value);
            const prevGroup = getImportGroup(
              prevImp.source.value as string,
              groups
            );
            const prevPriority =
              prevGroup?.priority ??
              (prevIsExternal
                ? IMPORT_PRIORITIES.EXTERNAL
                : IMPORT_PRIORITIES.DEFAULT);

            if (prevPriority > priority) {
              isGrouped = false;
              break;
            }
          }

          if (currentGroup !== null && currentGroup !== groupPattern) {
            const prevToken = sourceCode.getTokenBefore(imp);
            const hasNewline =
              prevToken && prevToken.loc.end.line < imp.loc.start.line - 1;
            if (!hasNewline) {
              isGrouped = false;
              break;
            }
          }

          currentGroup = groupPattern;
        }

        if (!isGrouped) {
          const { sortedImports } = sortImports(
            validImports,
            groups,
            context as any
          );

          context.report({
            node: validImports[0],
            messageId: 'ungrouped',
            fix(fixer: TSESLint.RuleFixer) {
              const newText = formatSortedImports(
                sortedImports,
                groups,
                sourceCode
              );
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
