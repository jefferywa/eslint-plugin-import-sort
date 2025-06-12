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
        const sorted = [...imports].sort((a, b) => {
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
        for (let i = 0; i < imports.length; i++) {
          if (imports[i] !== sorted[i]) {
            isSorted = false;
            break;
          }
        }
        if (!isSorted) {
          context.report({
            node: imports[0],
            messageId: 'unsorted',
            fix(fixer: TSESLint.RuleFixer) {
              const newText = sorted
                .map((imp) => sourceCode.getText(imp))
                .join('\n');
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
