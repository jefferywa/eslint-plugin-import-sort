import { TSESLint, TSESTree } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'unsorted', []> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort imports alphabetically by import path.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      unsorted: 'Imports are not sorted alphabetically by import path.',
    },
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<'unsorted', []>) {
    const sourceCode = context.getSourceCode();
    return {
      Program(node: TSESTree.Program) {
        const imports = node.body.filter(
          (n: TSESTree.Node): n is TSESTree.ImportDeclaration =>
            n.type === 'ImportDeclaration'
        );

        if (imports.length <= 1) return;

        const sorted = [...imports].sort((a, b) => {
          const aPath = a.source.value as string;
          const bPath = b.source.value as string;
          return aPath.localeCompare(bPath);
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
