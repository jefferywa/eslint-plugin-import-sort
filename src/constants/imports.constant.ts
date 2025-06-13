export const IMPORT_PATTERNS = {
  EXTERNAL: /^[^./]/,
  NPM: /^[a-zA-Z0-9_-]+$/,
  SCOPED: /^@/,
  ALIASED: /\//,
  RELATIVE: /^\.{0,2}\//,
  ABSOLUTE: /^\//,
  WINDOWS_ABSOLUTE: /^[A-Za-z]:\//,
  NON_RELATIVE: /^[^./]/,
} as const;

export const IMPORT_PRIORITIES = {
  EXTERNAL: -1,
  DEFAULT: Number.MAX_SAFE_INTEGER,
} as const;

export const IMPORT_TYPES = {
  NPM: 0,
  SCOPED: 1,
  ALIASED: 2,
  ABSOLUTE: 3,
  OTHER: 4,
} as const;
