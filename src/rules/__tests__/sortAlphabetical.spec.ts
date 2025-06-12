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
        'import-sort/import-sort-alphabetical': 'error',
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
        'import-sort/import-sort-alphabetical': 'error',
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

  it('should handle imports with different paths', async () => {
    const code = `
      import { Component } from "./components/Component.ts";
      import { Types } from "./types/index.ts";
      import { Utils } from "./utils.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should ignore imports when eslint-disable comment is present', async () => {
    const code = `
      /* eslint-disable import-sort/import-sort-alphabetical */
      import { C } from "./c.ts";
      import { A } from "./a.ts";
      import { B } from "./b.ts";
      /* eslint-enable import-sort/import-sort-alphabetical */
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should ignore next line when eslint-disable-next-line comment is present', async () => {
    const code = `
      import { A } from "./a.ts";
      // eslint-disable-next-line import-sort/import-sort-alphabetical
      import { C } from "./c.ts";
      import { B } from "./b.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(2);
    expect(results[0].messages[0].message).toBe(
      'Imports are not sorted alphabetically by import path.'
    );
    expect(results[0].messages[1].message).toBe(
      "Unused eslint-disable directive (no problems were reported from 'import-sort/import-sort-alphabetical')."
    );
  });
});
