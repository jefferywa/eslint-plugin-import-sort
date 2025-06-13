import { ENUMS, ERRORS } from '../constants';
import { ImportGroup } from '../interfaces';

export const validateGroups = (groups: ImportGroup[]): void => {
  if (!Array.isArray(groups)) {
    throw new Error(ERRORS.GROUPS_MUST_BE_ARRAY);
  }

  const patterns = new Set<string>();
  for (const group of groups) {
    if (!group.pattern) {
      throw new Error(ERRORS.GROUP_MUST_HAVE_PATTERN);
    }

    if (patterns.has(group.pattern)) {
      throw new Error(ERRORS.DUPLICATE_PATTERN(group.pattern));
    }
    patterns.add(group.pattern);

    try {
      new RegExp(group.pattern);
    } catch {
      throw new Error(ERRORS.INVALID_PATTERN(group.pattern));
    }

    if (group.sortMethod && !ENUMS.SORT_METHODS.includes(group.sortMethod)) {
      throw new Error(`Invalid sort method: ${group.sortMethod}`);
    }

    if (
      group.lengthTarget &&
      !ENUMS.LENGTH_TARGETS.includes(group.lengthTarget)
    ) {
      throw new Error(ERRORS.INVALID_LENGTH_TARGET);
    }

    if (
      group.priority !== undefined &&
      (typeof group.priority !== 'number' || group.priority < 0)
    ) {
      throw new Error('Group priority must be a non-negative number');
    }
  }
};
