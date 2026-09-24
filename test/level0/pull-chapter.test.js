// The pull's voice over a leaf: a box carrying no Vale reads no voice, and a
// Vale that behaves names a finding on the leaf's chapter alone.
// [[spec/design_output/pull#the-voice-reads-the-evidence]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { chapterOf, voiceFaults } from "../../src/scripts/pull-chapter.js";
import { semicolonVale } from "./semicolon-vale.js";

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a box carrying no Vale reads no voice, so the hand-back meets no voice finding", () => {
  const leaf = { path: "do", evidence: [{ name: "says", form: "text" }] };
  const one = {
    path: "spec/tickets/one.md",
    text: "---\nkind: [[ticket]]\n---\n\n# do\n\n## says\n\nA line; and more.\n",
  };
  assert.deepEqual(voiceFaults({ vale: "" }, one, leaf), []);
});

// The pull reads through voiceOver, the road the open and the note share. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a semicolon on the leaf's chapter names Characters at its file line, and one on the Ask refuses nothing", () => {
  const VALE = "/tree/.se/.runtime/bin/vale";
  const proc = fakeProc();
  proc.teach([VALE], semicolonVale());
  const leaf = { path: "do", evidence: [{ name: "says", form: "text" }] };
  const one = {
    path: "spec/tickets/one.md",
    text: "---\nkind: [[ticket]]\n---\n\n# Ask\n\nOne; two.\n\n# do\n\n## says\n\nA line; and more.\n",
  };
  const found = voiceFaults({ vale: VALE, proc, root: "/tree" }, one, leaf);
  assert.equal(found.length, 1, found.join("\n"));
  assert.match(found[0], /^do breaks Characters at line 13 of spec\/tickets\/one\.md/);
});

test("chapterOf reads the fields under a step's chapter, and a missing one stands nowhere", () => {
  const text = "# Ask\n\nA thing.\n\n# design\n\n## draft\n\n### approach\n\nIt reads.\n\n# Discussion\n";
  const found = chapterOf(text, "design/draft");
  assert.equal(found.stands, true);
  assert.deepEqual(found.fields.get("approach"), ["It reads."]);
  assert.equal(chapterOf(text, "design/review").stands, false);
});
