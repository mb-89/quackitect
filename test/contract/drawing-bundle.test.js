// The bundle step, run for real: esbuild reads the drawing's entry and writes
// the one script and the one style sheet a webview loads.
// [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { bundle, bundled, ENTRY, OUT, WEBVIEW } from "../../src/scripts/bundle.js";

const files = disk();
const here = files.exists(join(WEBVIEW, "node_modules", "esbuild"));

test("the step writes the route script and its style sheet off the entry", {
  skip: !here && "the drawing's modules stand uninstalled, so run ./RUNME.sh",
}, async () => {
  assert.ok(files.exists(ENTRY), "the entry stands");
  await bundle();
  assert.ok(bundled(files), "a fresh bundle reads as current");
  const said = files.read(OUT);
  assert.match(said, /react-flow/, "the script carries React Flow");
  assert.ok(
    files.exists(OUT.replace(/\.js$/, ".css")),
    "the style sheet lands beside it",
  );
});
