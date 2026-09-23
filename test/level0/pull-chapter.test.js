// The pull's voice over a leaf: a box carrying no Vale reads no voice, and the
// hand-back goes on as it did before the one reading.
// [[spec/design_output/pull#the-voice-reads-the-evidence]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { voiceFaults } from "../../src/scripts/pull-chapter.js";

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a box carrying no Vale reads no voice, so the hand-back meets no voice finding", () => {
  const leaf = { path: "do", evidence: [{ name: "says", form: "text" }] };
  const one = {
    path: "spec/tickets/one.md",
    text: "---\nkind: [[ticket]]\n---\n\n# do\n\n## says\n\nA line; and more.\n",
  };
  assert.deepEqual(voiceFaults({ vale: "" }, one, leaf), []);
});
