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
                pattern: '^react$',
                sortMethod: 'alphabetical',
                priority: 1,
              },
              {
                pattern: '^[a-z]',
                sortMethod: 'alphabetical',
                priority: 2,
              },
              {
                pattern: '.*\\.interface\\.ts',
                sortMethod: 'length',
                priority: 3,
              },
              {
                pattern: '.*\\.constant\\.ts',
                sortMethod: 'alphabetical',
                priority: 4,
              },
              {
                pattern: '.*\\.type\\.ts',
                sortMethod: 'alphabetical',
                priority: 5,
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
                pattern: '^react$',
                sortMethod: 'alphabetical',
                priority: 1,
              },
              {
                pattern: '^[a-z]',
                sortMethod: 'alphabetical',
                priority: 2,
              },
              {
                pattern: '.*\\.interface\\.ts',
                sortMethod: 'length',
                priority: 3,
              },
              {
                pattern: '.*\\.constant\\.ts',
                sortMethod: 'alphabetical',
                priority: 4,
              },
              {
                pattern: '.*\\.type\\.ts',
                sortMethod: 'alphabetical',
                priority: 5,
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
      priority: i + 1,
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
                  priority: 1,
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

  it('should sort external dependencies correctly', async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./user.type.ts";

      import { useState } from 'react';
      import { useEffect } from 'react';

      import { z } from 'zod';
      import { a } from 'axios';
      import { m } from 'moment';
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not grouped according to the specified patterns.'
    );
  });

  it('should autofix external dependencies order', async () => {
    let code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";

      import { UserType } from "./user.type.ts";
      import { ConfigType } from "./user.type.ts";

      import { useState, useEffect } from 'react';

      import { z } from 'zod';
      import { a } from 'axios';
      import { m } from 'moment';
    `;

    let expected = `import { a } from 'axios';
import { m } from 'moment';
import { useState, useEffect } from 'react';
import { z } from 'zod';

import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";
import { MediumInterface } from "./medium.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";
import { M_CONSTANT } from "./m.constant.ts";
import { Z_CONSTANT } from "./z.constant.ts";

import { UserType } from "./user.type.ts";
import { ConfigType } from "./user.type.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should handle mixed external and internal dependencies', async () => {
    const code = `
      import { z } from 'zod';
      import { LongInterface } from "./long.interface.ts";
      import { a } from 'axios';
      import { Short } from "./short.interface.ts";
      import { m } from 'moment';
      import { MediumInterface } from "./medium.interface.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not grouped according to the specified patterns.'
    );
  });

  it('should autofix mixed external and internal dependencies', async () => {
    let code = `
      import { z } from 'zod';
      import { LongInterface } from "./long.interface.ts";
      import { a } from 'axios';
      import { Short } from "./short.interface.ts";
      import { m } from 'moment';
      import { MediumInterface } from "./medium.interface.ts";
    `;

    let expected = `import { a } from 'axios';
import { m } from 'moment';
import { z } from 'zod';

import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";
import { MediumInterface } from "./medium.interface.ts";`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should validate configuration', async () => {
    const validConfig = {
      groups: [
        {
          pattern: '^react$',
          sortMethod: 'alphabetical',
          priority: 1,
        },
        {
          pattern: '^[a-z]',
          sortMethod: 'alphabetical',
          priority: 2,
        },
        {
          pattern: '.*\\.interface\\.ts',
          sortMethod: 'length',
          priority: 3,
        },
        {
          pattern: '.*\\.constant\\.ts',
          sortMethod: 'alphabetical',
          priority: 4,
        },
        {
          pattern: '.*\\.type\\.ts',
          sortMethod: 'alphabetical',
          priority: 5,
        },
      ],
    };

    const eslintWithValidConfig = new ESLint({
      overrideConfig: {
        plugins: {
          'import-sort': plugin as any,
        },
        rules: {
          'import-sort/import-sort-groups': ['error', validConfig],
        },
      },
    });
    const validResults = await eslintWithValidConfig.lintText(
      'import { x } from "x";'
    );
    expect(validResults[0].messages).toHaveLength(0);

    const eslintWithInvalidSortMethod = new ESLint({
      overrideConfig: {
        plugins: {
          'import-sort': plugin as any,
        },
        rules: {
          'import-sort/import-sort-groups': [
            'error',
            {
              groups: [
                { pattern: '^react$', sortMethod: 'invalid', priority: 1 },
              ],
            },
          ],
        },
      },
    });
    await expect(
      eslintWithInvalidSortMethod.lintText('import { x } from "x";')
    ).rejects.toThrow();

    const eslintWithInvalidLengthTarget = new ESLint({
      overrideConfig: {
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
                  sortMethod: 'length',
                  lengthTarget: 'invalid',
                  priority: 1,
                },
              ],
            },
          ],
        },
      },
    });
    await expect(
      eslintWithInvalidLengthTarget.lintText('import { x } from "x";')
    ).rejects.toThrow();

    const eslintWithInvalidPriority = new ESLint({
      overrideConfig: {
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
                  priority: '1',
                },
              ],
            },
          ],
        },
      },
    });
    await expect(
      eslintWithInvalidPriority.lintText('import { x } from "x";')
    ).rejects.toThrow();
  });

  it('should allow external dependencies to be not first if group config specifies', async () => {
    const eslintWithCustomGroups = new ESLint({
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
                  sortMethod: 'alphabetical',
                  priority: 2,
                },
                {
                  pattern: '^react$',
                  sortMethod: 'alphabetical',
                  priority: 1,
                },
                {
                  pattern: '^[^./]',
                  sortMethod: 'alphabetical',
                  priority: 4,
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

    const code = `
      import React from 'react';
      import { a } from 'axios';
      import { LongInterface } from "./long.interface.ts";
      import { Z_CONSTANT } from "./z.constant.ts";
      import { b } from 'buffer';
      import { Short } from "./short.interface.ts";
      import { A_CONSTANT } from "./a.constant.ts";
    `;

    const expected = `import React from 'react';

import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";
import { Z_CONSTANT } from "./z.constant.ts";

import { a } from 'axios';
import { b } from 'buffer';`;

    const results = await eslintWithCustomGroups.lintText(
      code.replace(/^ +/gm, '')
    );
    expect(results[0].output?.trim()).toBe(expected);
  });
});
