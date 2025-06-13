export const RULE_TYPE = 'suggestion' as const;

export const MESSAGES = {
  UNSORTED: 'Imports are not properly sorted',
  UNSORTED_ALPHABETICAL:
    'Imports are not sorted alphabetically by import path.',
  UNSORTED_LENGTH: 'Imports are not sorted by length of the import path.',
  UNGROUPED: 'Imports are not grouped according to the specified patterns.',
  MISSING_NEWLINE: 'Missing newline between import groups',
} as const;

export const DESCRIPTIONS = {
  ALPHABETICAL: 'Sort imports alphabetically by import path.',
  LENGTH: 'Sort imports by length of the import path.',
  GROUPS: 'Group imports by pattern.',
  COMBINED: 'Sort imports within groups.',
  LOWER_PRIORITY: 'Lower number means higher priority (appears first)',
} as const;
