export const ERRORS = {
  GROUPS_MUST_BE_ARRAY: 'Groups must be an array',
  GROUP_MUST_HAVE_PATTERN: 'Each group must have a pattern',
  DUPLICATE_PATTERN: (pattern: string) => `Duplicate group pattern: ${pattern}`,
  INVALID_PATTERN: (pattern: string) => `Invalid group pattern: ${pattern}`,
  INVALID_LENGTH_TARGET:
    'Invalid lengthTarget option. Must be either "from" or "full"',
} as const;
