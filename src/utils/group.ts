import { ImportGroup } from '../interfaces/index';

export function sortGroupsByPriority(groups: ImportGroup[]): ImportGroup[] {
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
  const sortedGroups = sortGroupsByPriority(groups);
  for (const group of sortedGroups) {
    if (new RegExp(group.pattern).test(importPath)) {
      return group;
    }
  }
  return null;
}
