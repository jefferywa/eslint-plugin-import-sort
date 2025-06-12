import { ESLint } from 'eslint';
import plugin from '../../index';

describe('sortCombined', () => {
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
        'import-sort/import-sort': [
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
        'import-sort/import-sort': [
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

  it('should sort imports by group and then by specified method', async () => {
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
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not properly sorted'
    );
  });

  it('should handle mixed quotes in imports', async () => {
    const code = `
      import { LongInterface } from './long.interface.ts';
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from './medium.interface.ts';

      import { A_CONSTANT } from './a.constant.ts';
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from './z.constant.ts';

      import { UserType } from "./user.type.ts";
      import { ConfigType } from './config.type.ts';
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not properly sorted'
    );
  });

  it('should preserve quote style when autofixing', async () => {
    let code = `
      import { LongInterface } from './long.interface.ts';
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from './medium.interface.ts';

      import { Z_CONSTANT } from './z.constant.ts';
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from './m.constant.ts';

      import { ConfigType } from "./config.type.ts";
      import { UserType } from './user.type.ts';
    `;

    let expected = `import { LongInterface } from './long.interface.ts';
import { Short } from "./short.interface.ts";
import { MediumInterface } from './medium.interface.ts';

import { A_CONSTANT } from "./a.constant.ts";
import { M_CONSTANT } from './m.constant.ts';
import { Z_CONSTANT } from './z.constant.ts';

import { ConfigType } from "./config.type.ts";
import { UserType } from './user.type.ts';`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should report error for incorrect sorting', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { Z_CONSTANT } from "./z.constant.ts";
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";

      import { ConfigType } from "./config.type.ts";
      import { UserType } from "./user.type.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not properly sorted'
    );
  });

  it('should autofix incorrect sorting', async () => {
    let code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { Z_CONSTANT } from "./z.constant.ts";
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";

      import { ConfigType } from "./config.type.ts";
      import { UserType } from "./user.type.ts";
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
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not properly sorted'
    );
  });

  it('should report error for missing newline between groups', async () => {
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
    expect(results[0].messages).toHaveLength(3);
    expect(results[0].messages[0].message).toBe(
      'Imports are not properly sorted'
    );
    expect(results[0].messages[1].message).toBe(
      'Missing newline between import groups'
    );
    expect(results[0].messages[2].message).toBe(
      'Missing newline between import groups'
    );
  });

  it('should autofix missing newlines between groups', async () => {
    let code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";
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

  it('should ignore imports when eslint-disable comment is present', async () => {
    const code = `
      /* eslint-disable import-sort/import-sort */
      import { A_CONSTANT } from "./a.constant.ts";
      import { LongInterface } from "./long.interface.ts";
      import { UserType } from "./user.type.ts";
      /* eslint-enable import-sort/import-sort */
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should ignore next line when eslint-disable-next-line comment is present', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      // eslint-disable-next-line import-sort/import-sort
      import { A_CONSTANT } from "./a.constant.ts";
      import { UserType } from "./user.type.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(2);
    expect(results[0].messages[0].message).toBe(
      "Unused eslint-disable directive (no problems were reported from 'import-sort/import-sort')."
    );
    expect(results[0].messages[1].message).toBe(
      'Missing newline between import groups'
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
          'import-sort/import-sort': ['error', { groups: [] }],
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

  it('should handle large number of imports with multiple groups', async () => {
    const code = Array.from({ length: 100 }, (_, i) => {
      const group = i % 3;
      const suffix =
        group === 0 ? 'interface.ts' : group === 1 ? 'constant.ts' : 'type.ts';
      return `import { A${i} } from "./a${i}.${suffix}";`;
    }).join('\n');

    const eslint = new ESLint({
      overrideConfig: {
        plugins: {
          'import-sort': plugin as any,
        },
        rules: {
          'import-sort/import-sort': [
            'error',
            {
              groups: [
                { pattern: '.*\\.interface\\.ts$', priority: 1 },
                { pattern: '.*\\.constant\\.ts$', priority: 2 },
                { pattern: '.*\\.type\\.ts$', priority: 3 },
              ],
            },
          ],
        },
      },
    });

    const results = await eslint.lintText(code);
    expect(results[0].messages).toHaveLength(100);
    expect(results[0].messages[0].message).toBe(
      'Imports are not properly sorted'
    );
  });
});
