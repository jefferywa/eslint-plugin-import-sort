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
              {
                pattern: '.*\\.type\\.ts',
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
              {
                pattern: '.*\\.type\\.ts',
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

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./config.type.ts";
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

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./config.type.ts";
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

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./config.type.ts";
    `;

    let expected = `import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";
import { MediumInterface } from "./medium.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";
import { M_CONSTANT } from "./m.constant.ts";
import { Z_CONSTANT } from "./z.constant.ts";

import { ConfigType } from "./config.type.ts";
import { UserType } from "./user.type.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should handle imports with no matching group', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./config.type.ts";

      import { Utils } from "./utils.ts";
      import { Helpers } from "./helpers.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should ignore imports when eslint-disable comment is present', async () => {
    const code = `
      /* eslint-disable import-sort/import-sort-groups */
      import { A_CONSTANT } from "./a.constant.ts";
      import { LongInterface } from "./long.interface.ts";
      import { UserType } from "./user.type.ts";
      /* eslint-enable import-sort/import-sort-groups */
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should ignore next line when eslint-disable-next-line comment is present', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      // eslint-disable-next-line import-sort/import-sort-groups
      import { A_CONSTANT } from "./a.constant.ts";
      import { UserType } from "./user.type.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      "Unused eslint-disable directive (no problems were reported from 'import-sort/import-sort-groups')."
    );
  });

  it('should handle empty groups array', async () => {
    const eslintWithEmptyGroups = new ESLint({
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
          'import-sort/import-sort-groups': ['error', { groups: [] }],
        },
      },
    });

    const code = `
      import { A } from "./a.ts";
      import { B } from "./b.ts";
      import { C } from "./c.ts";
    `;

    const results = await eslintWithEmptyGroups.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });
});
