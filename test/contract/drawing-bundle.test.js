// The bundle step, run for real over a stub entry: esbuild reads it and writes
// the one script and the one style sheet a webview loads, into a temp folder.
// [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { bundle, WEBVIEW } from "../../src/scripts/bundle.js";

const files = disk();
const here = files.exists(join(WEBVIEW, "node_modules", "esbuild"));
const where = files.tempDir("bundle-");
after(() => files.remove(where));

test("the step writes a script and its style sheet off a stub entry", {
  skip: !here && "the drawing's modules stand uninstalled, so run ./RUNME.sh",
}, async () => {
  const entry = join(where, "entry.js");
  const out = join(where, "out", "route.js");
  files.write(join(where, "sheet.css"), ".stub-sheet { color: red; }\n");
  files.write(entry, 'import "./sheet.css";\nglobalThis.stubEntry = "stub-entry";\n');

  await bundle({ entry, out });
  assert.ok(files.exists(out), "the script lands where the step names");
  assert.match(files.read(out), /stub-entry/, "the script carries the entry");
  assert.match(
    files.read(out.replace(/\.js$/, ".css")),
    /stub-sheet/,
    "the style sheet lands beside it",
  );
});
