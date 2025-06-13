import { ImportGroup } from '../interfaces/index';

const regexCache = new Map<string, RegExp>();

const getRegex = (pattern: string): RegExp => {
  const cached = regexCache.get(pattern);
  if (cached) {
    return cached;
  }
  const regex = new RegExp(pattern);
  regexCache.set(pattern, regex);
  return regex;
};

export function sortGroupsByPriority(groups: ImportGroup[]): ImportGroup[] {
  if (!groups.length) {
    return [];
  }
  return [...groups].sort((a, b) => {
    const pa = a.priority ?? Number.MAX_SAFE_INTEGER;
    const pb = b.priority ?? Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });
}
export function getImportGroup(
  importPath: string,
  groups: ImportGroup[]
): ImportGroup | null {
  if (!importPath || !groups.length) {
    return null;
  }

  const sortedGroups = sortGroupsByPriority(groups);
  for (const group of sortedGroups) {
    try {
      const regex = getRegex(group.pattern);
      if (regex.test(importPath)) {
        return group;
      }
    } catch (error) {
      continue;
    }
  }
  return null;
}
