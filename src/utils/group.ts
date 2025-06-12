import { ImportGroup } from "../interfaces/index";

export function getImportGroup(
  importPath: string,
  groups: ImportGroup[]
): ImportGroup | null {
  for (const group of groups) {
    if (new RegExp(group.pattern).test(importPath)) {
      return group;
    }
  }
  return null;
}
