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
            "pattern": "^react$",
            "priority": 1,
            "sortMethod": "alphabetical"
          },
          {
            "pattern": ".*\\.interface\\.ts$",
            "priority": 2,
            "sortMethod": "length"
          },
          {
            "pattern": ".*\\.constant\\.ts$",
            "priority": 3,
            "sortMethod": "alphabetical"
          },
          {
            "pattern": ".*\\.type\\.ts$",
            "priority": 4,
            "sortMethod": "alphabetical"
          }
        ]
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

- `pattern`: A glob pattern to match file types (e.g., "*.interface.ts")
- `priority`: (optional) A number that determines the group's position in the sorted imports. Lower numbers appear first. If not specified, the group will be placed after all groups with defined priorities.
- `sortMethod`: (optional) How to sort imports within the group:
  - `"length"`: Sort by the length of the import path
  - `"alphabetical"`: Sort alphabetically
- `lengthTarget`: (optional) When using `sortMethod: "length"`, specifies what to measure:
  - `"from"`: Only measure the import path length
  - `"full"`: Measure the entire import statement length

## Example

Before:

```typescript
import { Utils } from "./utils.ts";
import { UserInterface } from "./user.interface.ts";
import { Constants } from "./app.constant.ts";
import React from "react";
```

After (with the configuration above):

```typescript
import React from "react";

import { UserInterface } from "./user.interface.ts";

import { Constants } from "./app.constant.ts";

import { Utils } from "./utils.ts";
```

## License

MIT
