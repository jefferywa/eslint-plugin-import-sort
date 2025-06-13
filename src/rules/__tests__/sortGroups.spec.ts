import { ESLint } from 'eslint';
import plugin from '../../index';
import { SORT_METHOD, IMPORT_PATTERNS } from '../../constants';

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
                priority: 2,
              },
              {
                pattern: '.*\\.constant\\.ts',
                sortMethod: 'alphabetical',
                priority: 3,
              },
              {
                pattern: '.*\\.type\\.ts',
                sortMethod: 'alphabetical',
                priority: 4,
              },
              {
                pattern: '^react$',
                sortMethod: 'alphabetical',
                priority: 1,
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
                priority: 2,
              },
              {
                pattern: '.*\\.constant\\.ts',
                sortMethod: 'alphabetical',
                priority: 3,
              },
              {
                pattern: '.*\\.type\\.ts',
                sortMethod: 'alphabetical',
                priority: 4,
              },
              {
                pattern: '^react$',
                sortMethod: 'alphabetical',
                priority: 1,
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
      import { Utils } from "./utils.ts";
      import { Helpers } from "./helpers.ts";

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
      'Imports are not grouped according to the specified patterns.'
    );
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

  it('should respect group priorities when sorting', async () => {
    const code = `
      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./config.type.ts";

      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import React from "react";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not grouped according to the specified patterns.'
    );
  });

  it('should autofix imports according to group priorities', async () => {
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
                  pattern: '^react$',
                  sortMethod: 'alphabetical',
                  priority: 1,
                },
                {
                  pattern: '.*\\.interface\\.ts',
                  sortMethod: 'length',
                  priority: 2,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 3,
                },
                {
                  pattern: '.*\\.type\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 4,
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

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./config.type.ts";

      import React from "react";
    `;

    let expected = `import React from "react";

import { LongInterface } from "./long.interface.ts";
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
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should handle groups without priority', async () => {
    const eslintWithMixedPriorities = new ESLint({
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
                  pattern: '^react$',
                  sortMethod: 'alphabetical',
                  priority: 1,
                },
                {
                  pattern: '.*\\.interface\\.ts',
                  sortMethod: 'length',
                  priority: 2,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 3,
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
      import { LongInterface } from "./long.interface.ts";
      import React from "react";
    `;

    let expected = `import React from "react";

import { LongInterface } from "./long.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithMixedPriorities.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should group external dependencies together', async () => {
    const eslintWithExternalDeps = new ESLint({
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
                  sortMethod: SORT_METHOD.LENGTH,
                  priority: 1,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 2,
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
      import { LongInterface } from "./long.interface.ts";
      import axios from "axios";
      import { useState } from "react";
      import lodash from "lodash";
    `;

    let expected = `import axios from "axios";
import lodash from "lodash";
import { useState } from "react";

import { LongInterface } from "./long.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithExternalDeps.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should correctly identify external dependencies with different patterns', async () => {
    const eslintWithExternalDeps = new ESLint({
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
                  sortMethod: SORT_METHOD.LENGTH,
                  priority: 1,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 2,
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
      import { LongInterface } from "./long.interface.ts";
      import axios from "axios";
      import { useState } from "react";
      import lodash from "lodash";
      import { Button } from "@mui/material";
      import { Config } from "src/config";
      import { Utils } from "C:/Users/utils";
    `;

    let expected = `import { Button } from "@mui/material";
import axios from "axios";
import { Utils } from "C:/Users/utils";
import lodash from "lodash";
import { useState } from "react";
import { Config } from "src/config";

import { LongInterface } from "./long.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithExternalDeps.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should sort external dependencies by path length (lengthTarget: from)', async () => {
    const eslintWithExternalDeps = new ESLint({
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
                  pattern: IMPORT_PATTERNS.NON_RELATIVE.toString().slice(1, -1),
                  sortMethod: 'length',
                  lengthTarget: 'from',
                  priority: 1,
                },
                {
                  pattern: '.*\\.interface\\.ts',
                  sortMethod: 'length',
                  priority: 2,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 3,
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
      import { LongInterface } from "./long.interface.ts";
      import axios from "axios";
      import { useState } from "react";
      import lodash from "lodash";
    `;

    let expected = `import axios from "axios";
import { useState } from "react";
import lodash from "lodash";

import { LongInterface } from "./long.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithExternalDeps.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should sort external dependencies by full import length (lengthTarget: full)', async () => {
    const eslintWithExternalDeps = new ESLint({
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
                  pattern: IMPORT_PATTERNS.NON_RELATIVE.toString().slice(1, -1),
                  sortMethod: 'length',
                  lengthTarget: 'full',
                  priority: 1,
                },
                {
                  pattern: '.*\\.interface\\.ts',
                  sortMethod: 'length',
                  priority: 2,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 3,
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
      import { LongInterface } from "./long.interface.ts";
      import axios from "axios";
      import { useState } from "react";
      import lodash from "lodash";
    `;

    let expected = `import axios from "axios";
      import lodash from "lodash";
      import { useState } from "react";

      import { LongInterface } from "./long.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithExternalDeps.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should sort external dependencies by alphabetical', async () => {
    const eslintWithExternalDeps = new ESLint({
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
                  pattern: IMPORT_PATTERNS.NON_RELATIVE.toString().slice(1, -1),
                  sortMethod: 'alphabetical',
                  priority: 1,
                },
                {
                  pattern: '.*\\.interface\\.ts',
                  sortMethod: 'length',
                  priority: 2,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 3,
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
      import { LongInterface } from "./long.interface.ts";
      import axios from "axios";
      import { useState } from "react";
      import lodash from "lodash";
    `;

    let expected = `import axios from "axios";
    import lodash from "lodash";
    import { useState } from "react";

      import { LongInterface } from "./long.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithExternalDeps.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should handle both single and double quotes in imports', async () => {
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
    expect(results[0].messages).toHaveLength(0);
  });

  it('should preserve original quote style when autofixing', async () => {
    let code = `
      import { A_CONSTANT } from './a.constant.ts';
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from './z.constant.ts';

      import { LongInterface } from "./long.interface.ts";
      import { Short } from './short.interface.ts';
      import { MediumInterface } from "./medium.interface.ts";

      import { UserType } from './user.type.ts';
      import { ConfigType } from "./config.type.ts";
    `;

    let expected = `import { LongInterface } from "./long.interface.ts";
import { Short } from './short.interface.ts';
import { MediumInterface } from "./medium.interface.ts";

import { A_CONSTANT } from './a.constant.ts';
import { M_CONSTANT } from "./m.constant.ts";
import { Z_CONSTANT } from './z.constant.ts';

import { ConfigType } from "./config.type.ts";
import { UserType } from './user.type.ts';`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });

  it('should handle empty configuration', async () => {
    const code = `
      import { A } from "./a.ts";
      import { B } from "./b.ts";
      import { C } from "./c.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle large number of groups', async () => {
    const groups = Array.from({ length: 20 }, (_, i) => ({
      pattern: `^[${i}]`,
      order: i + 1,
    }));

    const code = `
      import { A } from "./a.ts";
      import { B } from "./b.ts";
      import { C } from "./c.ts";
    `;

    const eslint = new ESLint({
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
              groups,
            },
          ],
        },
      },
    });

    const results = await eslint.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle large number of imports', async () => {
    const imports = Array.from(
      { length: 50 },
      (_, i) => `import { A${i} } from "./a${i}.ts";`
    ).join('\n');

    const code = `
      ${imports}
    `;

    const eslint = new ESLint({
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
                  pattern: '^[./]',
                  order: 1,
                },
              ],
            },
          ],
        },
      },
    });

    const results = await eslint.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should place external dependencies at the top when no priority is specified', async () => {
    const eslintWithExternalDeps = new ESLint({
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
                  sortMethod: SORT_METHOD.LENGTH,
                  priority: 1,
                },
                {
                  pattern: '.*\\.constant\\.ts',
                  sortMethod: 'alphabetical',
                  priority: 2,
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
      import { LongInterface } from "./long.interface.ts";
      import { useState } from "react";
      import lodash from "lodash";
      import axios from "axios";
    `;

    let expected = `import axios from "axios";
import lodash from "lodash";
import { useState } from "react";

import { LongInterface } from "./long.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithExternalDeps.lintText(code);
    expect(results[0].output?.trim()).toBe(expected.trim());
  });
});
