export const SCHEMA_TYPES = {
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
} as const;

export const SORT_METHOD = {
  LENGTH: 'length',
  ALPHABETICAL: 'alphabetical',
} as const;

export const LENGTH_TARGET = {
  FROM: 'from',
  FULL: 'full',
} as const;

export const ENUMS = {
  SORT_METHODS: [SORT_METHOD.LENGTH, SORT_METHOD.ALPHABETICAL] as const,
  LENGTH_TARGETS: [LENGTH_TARGET.FROM, LENGTH_TARGET.FULL] as const,
} as const;
