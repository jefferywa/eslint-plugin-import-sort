import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { ImportGroup } from "../interfaces/index";
import { getImportGroup } from "../utils/group";

export interface Options {
  groups: ImportGroup[];
}

const rule: TSESLint.RuleModule<"ungrouped", [Options]> = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Group imports by pattern.",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          groups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
              },
              required: ["pattern"],
            },
          },
        },
        required: ["groups"],
      },
    ],
    messages: {
      ungrouped: "Imports are not grouped according to the specified patterns.",
    },
  },
  defaultOptions: [{ groups: [] }],
  create(context) {
    const options = context.options[0];
    const sourceCode = context.getSourceCode();
    return {
      Program(node) {
        const imports = node.body.filter(
          (n): n is TSESTree.ImportDeclaration => n.type === "ImportDeclaration"
        );
        if (imports.length <= 1) return;
        // Группируем импорты
        const groupMap = new Map<string, TSESTree.ImportDeclaration[]>();
        imports.forEach((imp) => {
          const group =
            getImportGroup(imp.source.value as string, options.groups) || null;
          const key = group ? group.pattern : "__default__";
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push(imp);
        });
        // Собираем импорты по группам в порядке options.groups
        const ordered: TSESTree.ImportDeclaration[] = [];
        options.groups.forEach((group) => {
          const arr = groupMap.get(group.pattern);
          if (arr) ordered.push(...arr);
        });
        if (groupMap.get("__default__")) {
          ordered.push(...groupMap.get("__default__")!);
        }
        // Проверяем порядок
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
            messageId: "ungrouped",
            fix(fixer) {
              const newText = ordered
                .map((imp) => sourceCode.getText(imp))
                .join("\n");
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
