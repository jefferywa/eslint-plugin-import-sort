# eslint-plugin-import-sort

ESLint plugin for sorting imports by length, alphabetically, and by file type groups.

## Installation

```bash
yarn add -D eslint-plugin-import-sort
```

## Usage

Add `import-sort` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["import-sort"]
}
```

Then configure the rules you want to use under the rules section:

```json
{
  "rules": {
    "import-sort/import-sort": [
      "error",
      {
        "groups": [
          {
            "pattern": "*.interface.ts",
            "order": 1,
            "sortByLength": true,
            "sortAlphabetically": false
          },
          {
            "pattern": "*.constant.ts",
            "order": 2,
            "sortByLength": false,
            "sortAlphabetically": true
          },
          {
            "pattern": "*.type.ts",
            "order": 3,
            "sortByLength": true,
            "sortAlphabetically": true
          }
        ],
        "sortByLength": true,
        "sortAlphabetically": true,
        "defaultGroupOrder": 999,
        "defaultSortByLength": true,
        "defaultSortAlphabetically": true
      }
    ]
  }
}
```

## Development

```bash
# Install dependencies
yarn install

# Build the plugin
yarn build

# Run tests
yarn test

# Run linter
yarn lint
```

## Options

The rule accepts an options object with the following properties:

### groups

An array of objects that define import groups. Each group has:

- `pattern`: A glob pattern to match file types (e.g., "\*.interface.ts")
- `order`: A number that determines the group's position in the sorted imports
- `sortByLength`: (optional) Boolean that determines whether imports in this group should be sorted by length
- `sortAlphabetically`: (optional) Boolean that determines whether imports in this group should be sorted alphabetically

### Global Options

- `sortByLength`: Boolean that determines whether imports should be sorted by length within their groups (default: true)
- `sortAlphabetically`: Boolean that determines whether imports should be sorted alphabetically within their groups (default: true)
- `defaultGroupOrder`: Number that determines the order of imports that don't match any group pattern (default: 999)
- `defaultSortByLength`: Boolean that determines the default sorting by length for groups that don't specify it (default: true)
- `defaultSortAlphabetically`: Boolean that determines the default alphabetical sorting for groups that don't specify it (default: true)

## Example

Before:

```typescript
import { Component } from "./my.component";
import { UserInterface } from "./user.interface";
import { Constants } from "./app.constant";
import { Utils } from "./utils.util";
```

After (with default configuration):

```typescript
import { UserInterface } from "./user.interface";
import { Constants } from "./app.constant";
import { Utils } from "./utils.util";
import { Component } from "./my.component";
```

## License

MIT
