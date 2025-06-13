import { TSESLint } from '@typescript-eslint/utils';
import { JSONSchema4 } from '@typescript-eslint/utils/dist/json-schema';

export interface RuleMessage {
  id: string;
  message: string;
}

export interface RuleConfig<T> {
  name: string;
  description: string;
  messages: RuleMessage[];
  schema: JSONSchema4 | readonly JSONSchema4[];
  defaultOptions: T;
  create: (
    context: TSESLint.RuleContext<string, [T]>,
    options: T
  ) => TSESLint.RuleListener;
}
