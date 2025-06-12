import { ESLint } from 'eslint';
import plugin from '../../index';

describe('sortGroups', () => {
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
        'import-sort/import-sort-groups': [
          'error',
          {
            groups: [
              {
                pattern: '.*\\.interface\\.ts',
                sortMethod: 'length',
              },
              {
                pattern: '.*\\.constant\\.ts',
                sortMethod: 'alphabetical',
              },
            ],
          },
        ],
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
        'import-sort/import-sort-groups': [
          'error',
          {
            groups: [
              {
                pattern: '.*\\.interface\\.ts',
                sortMethod: 'length',
              },
              {
                pattern: '.*\\.constant\\.ts',
                sortMethod: 'alphabetical',
              },
            ],
          },
        ],
      },
    },
  });

  it('should maintain group order for mixed imports', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);

    expect(results[0].messages).toHaveLength(0);
  });

  it('should report error for incorrect group order', async () => {
    const code = `
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);

    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not grouped according to the specified patterns.'
    );
  });

  it('should autofix incorrect group order', async () => {
    let code = `
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";
    `;
    let expected = `import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";
import { MediumInterface } from "./medium.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";
import { M_CONSTANT } from "./m.constant.ts";
import { Z_CONSTANT } from "./z.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should autofix incorrect group order with lengthTarget: full', async () => {
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
          'import-sort/import-sort-groups': [
            'error',
            {
              groups: [
                {
                  pattern: '.*\\.interface\\.ts',
                  sortMethod: 'length',
                  lengthTarget: 'full',
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                },
              ],
            },
          ],
        },
      },
      fix: true,
    });

    let code = `
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";
    `;
    let expected = `import { Short } from "./short.interface.ts";
import { LongInterface } from "./long.interface.ts";
import { MediumInterface } from "./medium.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";
import { M_CONSTANT } from "./m.constant.ts";
import { Z_CONSTANT } from "./z.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFixFull.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });
});
