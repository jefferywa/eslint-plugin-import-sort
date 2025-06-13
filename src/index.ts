import sortCombined from './rules/sortCombined.rule';
import sortLength from './rules/sortLength.rule';
import sortAlphabetical from './rules/sortAlphabetical.rule';
import sortGroups from './rules/sortGroups.rule';

export default {
  rules: {
    'import-sort': sortCombined,
    'import-sort-length': sortLength,
    'import-sort-alphabetical': sortAlphabetical,
    'import-sort-groups': sortGroups,
  },
};
