# README

## eslint-plugin-import-sort

ESLint plugin for grouping and sorting imports according to custom rules. Based on [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import).

[![Version npm](https://img.shields.io/badge/npm-v1.0.5-blue)](https://www.npmjs.com/package/@jefferywa/eslint-plugin-import-sort)
[![Version git](https://img.shields.io/badge/github-code-brightgreen)](https://github.com/jefferywa/eslint-plugin-import-sort)
[![Version git](https://img.shields.io/badge/github-issues-red)](https://github.com/jefferywa/eslint-plugin-import-sort/issues)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jefferywa/eslint-plugin-import-sort/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/jefferywa/eslint-plugin-import-sort/actions)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/jefferywa/eslint-plugin-import-sort/actions)

## Features

- Group imports by patterns (regular expressions)
- Set group order via `priority`
- Sort within groups: alphabetically (`alphabetical`) or by length (`length`)
- Support different length targets: path only (`from`) or full import line (`full`)
- Auto-fix and error messages for incorrect ordering
- Ignore via `eslint-disable` and `eslint-disable-next-line` comments

## Requirements

- Node.js >= 14
- ESLint >= 9.0.0
- TypeScript >= 5.0.0 (if using TypeScript)

## Installation

Using npm:

```bash
npm install eslint-plugin-import-sort --save-dev
```

Using yarn:

```bash
yarn add -D eslint-plugin-import-sort
```

Using pnpm:

```bash
pnpm add -D eslint-plugin-import-sort
```

## Peer Dependencies

This plugin has the following peer dependencies:

```json
{
  "peerDependencies": {
    "eslint": ">=9.0.0",
    "@typescript-eslint/utils": ">=8.0.0",
    "@typescript-eslint/types": ">=8.0.0"
  }
}
```

Make sure you have these dependencies installed in your project. If you're using TypeScript, you'll also need:

```json
{
  "devDependencies": {
    "typescript": ">=5.0.0",
    "@typescript-eslint/parser": ">=8.0.0"
  }
}
```

## Configuration

Add the plugin to your ESLint configuration:

```json
{
  "plugins": ["import-sort"],
  "rules": {
    "import-sort/import-sort-groups": ["error", {
      "groups": [
        { "pattern": "^react$", "sortMethod": "alphabetical", "priority": 1 },
        { "pattern": "^[^./]", "sortMethod": "alphabetical", "priority": 2 },
        { "pattern": ".*\\.interface\\.ts", "sortMethod": "length", "priority": 3 },
        { "pattern": ".*\\.constant\\.ts", "sortMethod": "alphabetical", "priority": 4 },
        { "pattern": ".*\\.type\\.ts", "sortMethod": "alphabetical", "priority": 5 }
      ]
    }]
  }
}
```

## How Grouping Works

- Each group is defined by a pattern (regular expression)
- An import is assigned to the first matching group (by priority)
- If no group matches, the import goes to the "default group" (at the end)
- Group priority is set by a number: lower number means higher priority (appears first)

## Sorting Within Groups

- `sortMethod: "alphabetical"` - sort alphabetically
- `sortMethod: "length"` - sort by length (defaults to `from`, can specify `lengthTarget: "full"` for the entire line)

## Examples

### 1. Groups and Order

```js
groups: [
  { pattern: '^react$', sortMethod: 'alphabetical', priority: 1 },
  { pattern: '^[^./]', sortMethod: 'alphabetical', priority: 2 },
  { pattern: '.*\\.interface\\.ts', sortMethod: 'length', priority: 3 },
  { pattern: '.*\\.constant\\.ts', sortMethod: 'alphabetical', priority: 4 },
  { pattern: '.*\\.type\\.ts', sortMethod: 'alphabetical', priority: 5 }
]
```

- React imports come first, then all external dependencies, then interfaces, constants, and types
- If the order is incorrect, ESLint will report an error and offer an auto-fix

### 2. Auto-fix

If group order or sorting within groups is incorrect, the plugin will automatically fix the import order.

### 3. Ignoring

- You can disable the rule for a file or line using comments:
  - `/* eslint-disable import-sort/import-sort-groups */`
  - `// eslint-disable-next-line import-sort/import-sort-groups`

### 4. Empty Groups Array

If the groups array is empty, the rule won't complain about import order.

### 5. Configuration Validation

- If invalid values are specified for `sortMethod`, `lengthTarget`, or `priority`, ESLint will report an error during linting.

### 6. Complex Grouping Example

```js
groups: [
  { pattern: '.*\\.interface\\.ts', sortMethod: 'alphabetical', priority: 1 },
  { pattern: '^[^./]', sortMethod: 'alphabetical', priority: 3 },
  { pattern: '.*\\.constant\\.ts', sortMethod: 'alphabetical', priority: 2 }
]
```

- Interfaces first, then constants, then external dependencies.

## Common Patterns

Here are some commonly used patterns for different types of imports:

- `^react$` - React imports
- `^[^./]` - External dependencies (any import that doesn't start with ./ or /)
- `^[./]` - Relative imports (starting with ./ or ../)
- `^@/` - Absolute imports from your project's source directory
- `.*\\.(interface|type)\\.ts$` - TypeScript interfaces and types
- `.*\\.constant\\.ts$` - Constant files
- `.*\\.(test|spec)\\.(ts|tsx)$` - Test files

## Recommendations

- Always explicitly specify groups and their priorities for predictable import order
- Use a separate pattern (`^react$`) for React and other special packages
- Use pattern `^[^./]` for external dependencies (any import that doesn't start with ./ or /)
- Use pattern `^[./]` for relative imports
- Consider using length-based sorting for interface files to group related interfaces together
- Use alphabetical sorting for constants and types for easier lookup

## Troubleshooting

### Common Issues

1. **Imports not being grouped correctly**
   - Check that your patterns are correct regular expressions
   - Verify that priorities are set correctly
   - Make sure there are no conflicting patterns

2. **Auto-fix not working**
   - Ensure you're running ESLint with the `--fix` option
   - Check that the plugin is properly installed and configured
   - Verify that there are no syntax errors in your imports

3. **TypeScript errors**
   - Make sure you have the correct TypeScript and @typescript-eslint dependencies
   - Verify that your tsconfig.json is properly configured
   - Check that the parser is set to @typescript-eslint/parser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Sorting behavior

By default, if an import does not match any specified group, it will be sorted alphabetically by its path. This means that imports are compared as plain strings, so absolute paths (such as `C:/Users/utils`) will appear before aliased paths (such as `src/config`) because the `/` character comes before letters in ASCII order. This is the intended behavior for strict alphabetical sorting.

## Testing

The plugin is thoroughly tested with Jest. Run tests using:

```bash
npm test
```

Test coverage includes:
- Group sorting functionality
- Alphabetical sorting
- Length-based sorting
- Auto-fix capabilities
- Error reporting
- Edge cases and invalid configurations

All tests are automatically run on GitHub Actions for each push and pull request.
