import sortCombined from "./rules/sortCombined";
import sortLength from "./rules/sortLength";
import sortAlphabetical from "./rules/sortAlphabetical";
import sortGroups from "./rules/sortGroups";

export default {
  rules: {
    "import-sort": sortCombined,
    "import-sort-length": sortLength,
    "import-sort-alphabetical": sortAlphabetical,
    "import-sort-groups": sortGroups,
  },
};
