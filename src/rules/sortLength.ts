import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface Options {
  lengthTarget?: 'from' | 'full';
}

const rule: TSESLint.RuleModule<'unsorted', [Options]> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort imports by length of the import path.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          lengthTarget: {
            type: 'string',
            enum: ['from', 'full'],
          },
        },
      },
    ],
    messages: {
      unsorted: 'Imports are not sorted by length of the import path.',
    },
  },
  defaultOptions: [{}],
  create(context: TSESLint.RuleContext<'unsorted', [Options]>) {
    const options = context.options[0];
    const sourceCode = context.getSourceCode();
    return {
      Program(node: TSESTree.Program) {
        const imports = node.body.filter(
          (n): n is TSESTree.ImportDeclaration => n.type === 'ImportDeclaration'
        );
        if (imports.length <= 1) return;

        const comments = sourceCode.getAllComments();

        const isDisabled = comments.some(
          (comment) =>
            comment.type === 'Block' &&
            comment.value.includes('eslint-disable') &&
            (comment.value.includes('import-sort/import-sort-length') ||
              !comment.value.includes('import-sort/'))
        );

        if (isDisabled) return;

        const validImports = imports.filter((imp) => {
          const prevToken = sourceCode.getTokenBefore(imp);
          if (!prevToken) return true;

          const prevComments = sourceCode.getCommentsBefore(prevToken);
          return !prevComments.some(
            (comment) =>
              comment.type === 'Line' &&
              comment.value.includes('eslint-disable-next-line') &&
              (comment.value.includes('import-sort/import-sort-length') ||
                !comment.value.includes('import-sort/'))
          );
        });

        if (validImports.length <= 1) return;

        const sorted = [...validImports].sort((a, b) => {
          if (options.lengthTarget === 'full') {
            const aFull = sourceCode.getText(a);
            const bFull = sourceCode.getText(b);
            return aFull.length - bFull.length;
          } else {
            const aLen = (a.source.value as string).length;
            const bLen = (b.source.value as string).length;
            return aLen - bLen;
          }
        });

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
              const newText = sorted
                .map((imp) => sourceCode.getText(imp))
                .join('\n');
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
};

export default rule;
