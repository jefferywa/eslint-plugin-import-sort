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

  it('should ignore imports when eslint-disable comment is present', async () => {
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

    let code = `
      /* eslint-disable import-sort/import-sort-length */
      import { MediumInterface } from "./medium.interface.ts";
      import { Short } from "./short.interface.ts";
      import { LongInterface } from "./long.interface.ts";
      /* eslint-enable import-sort/import-sort-length */
    `;

    const results = await eslintWithFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should ignore next line when eslint-disable-next-line comment is present', async () => {
    let code = `
      import { MediumInterface } from "./medium.interface.ts";
      // eslint-disable-next-line import-sort/import-sort-length
      import { Short } from "./short.interface.ts";
      import { LongInterface } from "./long.interface.ts";
    `;

    const results = await eslintWithFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle mixed quotes in imports', async () => {
    const code = `
      import { LongInterface } from './long.interface.ts';
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from './medium.interface.ts';
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should preserve quote style when autofixing', async () => {
    let code = `
      import { MediumInterface } from './medium.interface.ts';
      import { Short } from "./short.interface.ts";
      import { LongInterface } from './long.interface.ts';
    `;

    let expected = `import { LongInterface } from './long.interface.ts';
import { Short } from "./short.interface.ts";
import { MediumInterface } from './medium.interface.ts';`;

    code = code.replace(/^ +/gm, '');
    expected = expected.replace(/^ +/gm, '');

    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });

  it('should handle large number of imports', async () => {
    const imports = Array.from(
      { length: 100 },
      (_, i) => `import { A${i} } from "./a${i}.ts";`
    ).join('\n');

    const code = `
      ${imports}
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with long paths', async () => {
    const code = `
      import { A } from "./very/long/path/to/component/a.ts";
      import { B } from "./very/long/path/to/component/b.ts";
      import { C } from "./very/long/path/to/component/c.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with special characters in paths', async () => {
    const code = `
      import { A } from "./a-b-c.ts";
      import { B } from "./a_b_c.ts";
      import { C } from "./a.b.c.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with query parameters', async () => {
    const code = `
      import { A } from "./a.ts?v=1";
      import { B } from "./b.ts?v=2";
      import { C } from "./c.ts?v=3";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with hash fragments', async () => {
    const code = `
      import { A } from "./a.ts#section1";
      import { B } from "./b.ts#section2";
      import { C } from "./c.ts#section3";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with mixed path formats', async () => {
    const code = `
      import { A } from "./a.ts";
      import { B } from "../b.ts";
      import { C } from "../../c.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with absolute paths', async () => {
    const code = `
      import { A } from "/a.ts";
      import { B } from "/b.ts";
      import { C } from "/c.ts";
    `;

    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(0);
  });

  it('should handle imports with protocol', async () => {
    const code = `
      import { C } from "https://example.com/c.ts";
      import { B } from "http://example.com/b.ts";
      import { A } from "file:///a.ts";
    `;

    const eslint = new ESLint({
      overrideConfig: {
        plugins: {
          'import-sort': plugin as any,
        },
        rules: {
          'import-sort/import-sort-length': ['error', { lengthTarget: 'full' }],
        },
      },
    });

    const results = await eslint.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      'Imports are not sorted by length of the import path.'
    );
  });
});
