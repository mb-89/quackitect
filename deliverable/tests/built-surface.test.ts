// THE GENERATED SURFACE MUST MATCH ITS SOURCE.
//
// vscode/extension.js is esbuild output. It carries a banner saying so, and
// esbuild.mjs says in as many words that you only ever edit vscode/src.
//
// NOTHING CHECKED IT. Both drifts were silent, and both happened.
//
// - A HAND EDIT TO THE GENERATED FILE passes every test, then the next
//   `npm run build` throws it away without a word.
// - A FIX MADE IN src ALONE never reaches the running surface. The control it
//   fixed goes on doing nothing, and the person is told it was fixed.
//
// The second is the expensive one, because the report says "done".
//
// THIS TEST REBUILDS FROM SOURCE IN MEMORY and compares. It reproduces the real
// build exactly — same working directory, same options as esbuild.mjs — so a
// difference means the committed file is stale, never that the test drifted.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
// THE SAME OPTIONS, IMPORTED RATHER THAN COPIED. A copy drifts the day the build
// script gains an option, and this guard would then fail saying the committed
// file is stale — which would be false, and its remedy wrong.
import { VSCODE_BUILD } from "../engine/vscodebuild.ts";

const deliverable = fileURLToPath(new URL("../", import.meta.url));

test("the built extension matches its source", async () => {
  const out = await build({
    ...VSCODE_BUILD,
    absWorkingDir: deliverable,
    write: false,
    logLevel: "silent",
  });

  // AN EMPTY OUTPUT IS ITS OWN FAILURE, said rather than thrown as an index
  // error, so a reader learns the build produced nothing instead of reading a
  // stack trace.
  const files = out.outputFiles ?? [];
  assert.ok(files.length > 0, "the in-memory rebuild produced no output at all");
  const fresh = files[0].text;
  const committed = readFileSync(join(deliverable, "vscode", "extension.js"), "utf8");

  // THE MESSAGE CARRIES THE REMEDY, because the whole point is that the person
  // who trips this does not yet know the file is generated.
  assert.ok(
    fresh === committed,
    "vscode/extension.js does not match vscode/src/extension.ts. " +
      `Fresh build is ${fresh.length} bytes, the committed file is ${committed.length}. ` +
      "Edit vscode/src/extension.ts — never the generated file — then run `npm run build` from deliverable/.",
  );
});
