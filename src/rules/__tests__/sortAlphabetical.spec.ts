import { ESLint } from 'eslint';
import plugin from '../../index';

describe('sortAlphabetical', () => {
  const eslintWithFix = new ESLint({
    overrideConfig: {
      languageOptions: {
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'script',
        },
      },
      plugins: {
        'import-sort': plugin as any,
      },
      rules: {
        'import-sort/import-sort-alphabetical': ['error'],
      },
    },
    fix: true,
  });

  const eslintWithoutFix = new ESLint({
    overrideConfig: {
      languageOptions: {
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'script',
        },
      },
      plugins: {
        'import-sort': plugin as any,
      },
      rules: {
        'import-sort/import-sort-alphabetical': ['error'],
      },
    },
  });

  it('should sort imports alphabetically', async () => {
    const code = `
      import { A } from "./a.ts";
      import { B } from "./b.ts";
      import { C } from "./c.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);

    expect(results[0].messages).toHaveLength(0);
  });

  it('should report error for unsorted imports', async () => {
    const code = `
      import { C } from "./c.ts";
      import { A } from "./a.ts";
      import { B } from "./b.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);

    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not sorted alphabetically by import path.'
    );
  });

  it('should autofix unsorted imports', async () => {
    let code = `
      import { C } from "./c.ts";
      import { A } from "./a.ts";
      import { B } from "./b.ts";
    `;
    let expected = `import { A } from "./a.ts";
import { B } from "./b.ts";
import { C } from "./c.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });
});
