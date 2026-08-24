// ONLY THE SURFACE THE PANEL REACHES MAY EMIT MARKUP (i4, 2026-08-23).
//
// The owner's rule, in their words: "check which files are used by VS Code.
// These files can exist. Any other files cannot exist."
//
// A second surface accreted once over months and nothing objected, because
// nothing could. This is the check that objects.
//
// THE PREDICATE IS NOT WRITTEN HERE. It lives in engine/widgets.ts, which the
// write guard and the sweep both call. A copy of it in the test would be a
// second place holding one truth, which is the failure this whole round is
// about.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { strays, surfaceFiles } from "../engine/widgets.ts";

// THE CLAIM. Every file that emits markup is one the panel reaches.
test("only the surface the panel reaches emits markup", () => {
  const found = strays();
  assert.deepEqual(found, [], `these files emit markup and the panel never reaches them:\n${found.join("\n")}`);
});

// THE SURFACE MUST NOT BE EMPTY. A rule that compares against nothing passes
// for the wrong reason, and that is the silent pass this whole check exists to
// stop. A broken import walk would return one file and look green.
test("the panel reaches more than a handful of files", () => {
  assert.ok(surfaceFiles().size > 20, `the surface closure found only ${String(surfaceFiles().size)} files`);
});
