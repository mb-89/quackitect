// The rules over a shell script, which Vale reads none of.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { pathInScript, SCRIPT } from "../lib/scripts.js";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));

test("an interpolated path inside an inline script is refused", () => {
  const said = `from=$(node -e "import { x } from '$root/src/a.js';")`;
  const found = pathInScript(said, "install.sh");
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "NoPathInScript");
  assert.match(found[0].message, /relative path/);
});

test("changing into the root and passing a relative path passes", () => {
  const said = `from=$(cd "$root" && node -e "import { x } from './src/a.js';")`;
  assert.deepEqual(pathInScript(said, "install.sh"), []);
});

test("a variable outside an inline script passes", () => {
  assert.deepEqual(pathInScript(`cp "$tmp/$name" "$bin/vale"`, "install.sh"), []);
});

test("a comment carries no rule", () => {
  assert.deepEqual(pathInScript(`# node -e "$root/x.js"`, "install.sh"), []);
});

test("a PowerShell inline command is read the same way", () => {
  const said = `powershell -Command "Expand-Archive -LiteralPath '$tmp/$name'"`;
  assert.equal(pathInScript(said, "install.sh").length, 1);
});

test("every script in this tree passes the rule", () => {
  const scripts = readdirSync(join(root, "src", "scripts")).filter((n) =>
    SCRIPT.test(n),
  );
  assert.ok(scripts.length, "there is at least one script");
  for (const name of scripts) {
    const text = readFileSync(join(root, "src", "scripts", name), "utf8");
    assert.deepEqual(pathInScript(text, name), [], `${name} interpolates no path`);
  }
});
