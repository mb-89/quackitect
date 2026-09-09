// Only a missing Claude executable uses the optional-validation fallback.
// [[spec/design_output/copilot#setup-and-discovery]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePlugin } from "../../.claude/skills/level0/lib/plugin-check.js";

test("installed Claude validation results stay unchanged", () => {
  const result = { exitCode: 1, stdout: "invalid plugin", stderr: "" };
  assert.equal(
    validatePlugin(
      (argv, init) => {
        assert.deepEqual(argv, ["claude", "plugin", "validate", "plugin"]);
        assert.equal(init.cwd, "/tree");
        return result;
      },
      "plugin",
      "/tree",
    ),
    result,
  );
});

test("missing Claude falls back but other process errors stay errors", () => {
  const missing = Object.assign(new Error("missing"), { code: "ENOENT" });
  assert.deepEqual(
    validatePlugin(
      () => {
        throw missing;
      },
      "plugin",
      "/tree",
    ),
    { exitCode: 1, stdout: "", stderr: "" },
  );
  assert.throws(
    () =>
      validatePlugin(
        () => {
          throw new Error("denied");
        },
        "plugin",
        "/tree",
      ),
    /denied/,
  );
});
