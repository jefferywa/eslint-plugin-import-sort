import { ESLint } from 'eslint';
import plugin from '../../index';

describe('sortLength', () => {
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
        'import-sort/import-sort-length': ['error', { lengthTarget: 'from' }],
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
        'import-sort/import-sort-length': ['error', { lengthTarget: 'from' }],
      },
    },
  });

  it('should sort imports by from path length', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);

    expect(results[0].messages).toHaveLength(0);
  });

  it('should report error for unsorted imports', async () => {
    const code = `
      import { MediumInterface } from "./medium.interface.ts";
      import { Short } from "./short.interface.ts";
      import { LongInterface } from "./long.interface.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);

    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not sorted by length of the import path.'
    );
  });

  it('should autofix unsorted imports', async () => {
    let code = `
      import { MediumInterface } from "./medium.interface.ts";
      import { Short } from "./short.interface.ts";
      import { LongInterface } from "./long.interface.ts";
    `;

    let expected = `import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";
import { MediumInterface } from "./medium.interface.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should sort imports by full import length when lengthTarget is full', async () => {
    const eslintWithFixFull = new ESLint({
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
          'import-sort/import-sort-length': ['error', { lengthTarget: 'full' }],
        },
      },
      fix: true,
    });

    let code = `
      import { MediumInterface } from "./medium.interface.ts";
      import { Short } from "./short.interface.ts";
      import { LongInterface } from "./long.interface.ts";
    `;

    let expected = `import { Short } from "./short.interface.ts";
import { LongInterface } from "./long.interface.ts";
import { MediumInterface } from "./medium.interface.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFixFull.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });
});
