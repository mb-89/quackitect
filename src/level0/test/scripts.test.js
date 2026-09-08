// The rules over a shell script, which Vale reads none of.

import assert from "node:assert/strict";
import { test } from "node:test";
import { pathInScript } from "../lib/scripts.js";

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
