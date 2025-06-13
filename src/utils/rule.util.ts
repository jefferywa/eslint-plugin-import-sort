import { TSESLint } from '@typescript-eslint/utils';
import { RULE_TYPE } from '../constants';
import { RuleConfig } from '../interfaces/rule.interface';

export function createRule<T>(
  config: RuleConfig<T>
): TSESLint.RuleModule<string, [T]> {
  return {
    meta: {
      type: RULE_TYPE,
      docs: {
        description: config.description,
      },
      fixable: 'code',
      schema: config.schema,
      messages: config.messages.reduce(
        (acc, { id, message }) => ({ ...acc, [id]: message }),
        {}
      ),
    },
    defaultOptions: [config.defaultOptions],
    create(context: TSESLint.RuleContext<string, [T]>) {
      const options = context.options[0];
      return config.create(context, options);
    },
  };
}
