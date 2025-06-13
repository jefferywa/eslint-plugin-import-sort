import { TSESLint } from '@typescript-eslint/utils';
import { RuleOptions } from '../interfaces';
import { MessageIds } from '../interfaces/messages.interface';

export const ruleSchema: TSESLint.RuleMetaData<MessageIds>['schema'] = [
  {
    type: 'object',
    properties: {
      groups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pattern: { type: 'string' },
            sortMethod: {
              type: 'string',
              enum: ['length', 'alphabetical'],
            },
            lengthTarget: {
              type: 'string',
              enum: ['from', 'full'],
            },
            priority: {
              type: 'number',
              description: 'Lower number means higher priority (appears first)',
            },
          },
          required: ['pattern'],
        },
      },
    },
    required: ['groups'],
  },
];

export const defaultOptions: RuleOptions = {
  groups: [],
};
