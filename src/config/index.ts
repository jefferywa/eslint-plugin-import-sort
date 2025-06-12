import { TSESLint } from "@typescript-eslint/utils";
import { RuleOptions } from "../interfaces";

type MessageIds = "invalidImportOrder" | "missingNewlineBetweenGroups";

export const ruleSchema: TSESLint.RuleMetaData<MessageIds>["schema"] = [
  {
    type: "object",
    properties: {
      groups: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            sortMethod: {
              type: "string",
              enum: ["length", "alphabetical"],
            },
            lengthTarget: {
              type: "string",
              enum: ["from", "full"],
            },
          },
          required: ["pattern", "sortMethod"],
        },
      },
    },
    required: ["groups"],
  },
];

export const defaultOptions: RuleOptions = {
  groups: [],
};
