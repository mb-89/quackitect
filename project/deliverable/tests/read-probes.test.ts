// THE READING PROOF ASKS FOR WORDS, SO IT MUST ASK FOR WORDS.
//
// MEASURED AT BOOT, 2026-08-18. Four round trips on
// guidance/method/cloud-runner.md, where the probe's expected answer was
// `remedy; follow it. -` — three words a reader sees, plus the list marker of
// the NEXT bullet. Every answer a person would give was refused.
//
// The i35 field report of 2026-08-17 read the same symptom as line-break
// sensitivity. The third case below shows why that diagnosis was wrong: the
// matcher flattens whitespace on both sides already, so an anchor crossing a
// newline compares fine. Markdown punctuation was the fault.
//
// THE MATHS LIVES IN engine/readproof.ts and is called, never copied.
// tests/one-probe-maths.test.ts is what keeps that true.
import assert from "node:assert/strict";
import { test } from "node:test";
import { probesMissed, readingProbes } from "../engine/readproof.ts";
import { Session } from "../engine/session.ts";
import { freshRoot, gitInit } from "./helpers.ts";

// THE EXACT SHAPE THAT COST FOUR ROUND TRIPS, reproduced from
// guidance/method/cloud-runner.md's closing list.
const BULLETS = `# what you must not do

Some opening prose so the document clears the sixteen-word floor and the
probes are placed by fraction rather than served whole.

- DO NOT REINVENT THE ENTRYPOINT. It exists, it is tested, and a second one
  would drift from the first.
- DO NOT WORK AROUND A REFUSAL WITH ANOTHER LANE. Every refusal carries a
  remedy; follow it.
- DO NOT PUSH. Pushing is the person's act, here as everywhere.

A closing paragraph so the last probe has somewhere to land without running
off the end of the text.
`;

test("no probe asks for a markdown list marker, a heading hash or a table pipe", () => {
  const { ask, expect } = readingProbes(BULLETS);
  for (const a of [...ask, ...expect]) {
    for (const token of a.split(/\s+/)) {
      if (token === "") continue;
      assert.match(token, /[\p{L}\p{N}]/u, `a probe asks for "${token}", which is punctuation rather than a word: ${a}`);
    }
  }
});

test("the words a probe expects are the words a reader would read back", () => {
  const { expect } = readingProbes(BULLETS);
  const words = BULLETS.split(/\s+/).filter((w) => w !== "" && /[\p{L}\p{N}]/u.test(w));
  for (const e of expect) {
    assert.equal(e.split(" ").length, 4, `a probe expects ${e.split(" ").length} words, not 4: "${e}"`);
    assert.ok(words.join(" ").includes(e), `the expected answer "${e}" is not a run of the document's own words`);
  }
});

// THE DIAGNOSIS THE FIELD REPORT GOT WRONG, pinned so nobody re-derives it.
// Whitespace and case are flattened on both sides, so an answer whose words
// crossed a newline in the source was never the problem.
test("an answer is accepted however its whitespace and case fall", () => {
  const { expect } = readingProbes(BULLETS);
  const answer = expect.join("\n\n").toUpperCase();
  assert.deepEqual(probesMissed(expect, answer), [], "a correct answer was refused over whitespace or case");
});

test("a wrong answer names exactly the probes it missed", () => {
  const { expect } = readingProbes(BULLETS);
  assert.deepEqual(probesMissed(expect, expect[0]), expect.slice(1), "the miss list does not name exactly the probes that failed");
});

// THE MISS RIDES THE ANSWER, so a reader is never left guessing which of three
// probes failed. The field report names that guess as a round trip each time.
test("the pull hands back which probes were missed, not only that one was", async () => {
  const root = freshRoot();
  gitInit(root);
  const s = new Session(root);
  const first = await s.pull();
  assert.equal(first.pull, "read", "boot serves a document to prove");
  const wrong = await s.pull({ form: { read: "nothing like the document" } });
  assert.equal(wrong.pull, "read", "a wrong proof serves the same document again");
  assert.ok(Array.isArray(wrong.missed), "the answer does not say WHICH probes were missed");
  assert.ok((wrong.missed as string[]).length > 0, "the miss list is empty on a wrong answer");
  assert.match(String(wrong.note), /probe\(s\) were not answered/, "the note does not count the misses");
});
