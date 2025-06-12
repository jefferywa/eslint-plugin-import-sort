import { ESLint } from "eslint";
import plugin from "../../index";

describe("sortCombined", () => {
  const eslintWithFix = new ESLint({
    overrideConfig: {
      languageOptions: {
        parser: require("@typescript-eslint/parser"),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "script",
        },
      },
      plugins: {
        "import-sort": plugin as any,
      },
      rules: {
        "import-sort/import-sort": [
          "error",
          {
            groups: [
              {
                pattern: ".*\\.interface\\.ts",
                sortMethod: "length",
              },
              {
                pattern: ".*\\.constant\\.ts",
                sortMethod: "alphabetical",
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
        parser: require("@typescript-eslint/parser"),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "script",
        },
      },
      plugins: {
        "import-sort": plugin as any,
      },
      rules: {
        "import-sort/import-sort": [
          "error",
          {
            groups: [
              {
                pattern: ".*\\.interface\\.ts",
                sortMethod: "length",
              },
              {
                pattern: ".*\\.constant\\.ts",
                sortMethod: "alphabetical",
              },
            ],
          },
        ],
      },
    },
  });

  it("should sort imports by group and then by specified method", async () => {
    const code = `
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";
      import { LongInterface } from "./long.interface.ts";

      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
      import { Z_CONSTANT } from "./z.constant.ts";
    `;
    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      "Imports are not properly sorted"
    );
  });

  it("should report error for incorrect sorting", async () => {
    const code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { Z_CONSTANT } from "./z.constant.ts";
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
    `;
    const results = await eslintWithoutFix.lintText(code);
    expect(results[0].messages).toHaveLength(1);
    expect(results[0].messages[0].message).toBe(
      "Imports are not properly sorted"
    );
  });

  it("should autofix incorrect sorting", async () => {
    let code = `
      import { LongInterface } from "./long.interface.ts";
      import { Short } from "./short.interface.ts";
      import { MediumInterface } from "./medium.interface.ts";

      import { Z_CONSTANT } from "./z.constant.ts";
      import { A_CONSTANT } from "./a.constant.ts";
      import { M_CONSTANT } from "./m.constant.ts";
    `;
    let expected = `import { LongInterface } from "./long.interface.ts";
import { Short } from "./short.interface.ts";
import { MediumInterface } from "./medium.interface.ts";

import { A_CONSTANT } from "./a.constant.ts";
import { M_CONSTANT } from "./m.constant.ts";
import { Z_CONSTANT } from "./z.constant.ts";`;
    code = code.replace(/^ +/gm, "");
    expected = expected.replace(/^ +/gm, "");
    const results = await eslintWithFix.lintText(code);
    expect(results[0].output?.trim()).toBe(expected);
  });
});
