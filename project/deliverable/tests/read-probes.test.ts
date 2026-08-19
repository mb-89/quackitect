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
import { probesMissed, proofFor, readingProbes, readingWords } from "../engine/readproof.ts";
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

// THE ANSWER IS COUNTED THE WAY THE PROBE WAS CUT (i17 boot, 2026-08-18).
//
// WORDY drops a standalone em dash when the probe is BUILT, and until this fix
// nothing dropped it again when the answer came BACK. So a reader who obeyed
// the hint — "quote the words VERBATIM, punctuation and all" — was refused, and
// only the answer with the dash REMOVED was accepted. Two calls at boot, on a
// document that had been read.
const DASHED = `# the desk carries no vocabulary

Some opening prose so this document clears the sixteen-word floor and the
probes are placed by fraction rather than served whole, exactly as a real
guidance card is written by somebody who meant it.

This document carries NO list of doors and NO vocabulary on purpose \u2014
those must come from the sweep, so the desk stays current when the lanes
land or they change under it, and nothing written here goes stale behind.
`;

// THE FIXTURE IS TUNED so the middle probe lands exactly where the live one
// did: it asks for the 4 words that FOLLOW "and NO vocabulary on", and the
// document answers "purpose \u2014 those must come". The dash is not one of the
// four, because the probe never counted it.
test("the probe that cost the calls is the probe this fixture serves", () => {
  const { ask, expect } = readingProbes(DASHED);
  assert.ok(
    ask.some((a) => a.includes('FOLLOW "and NO vocabulary on"')),
    `the fixture drifted off the shape it pins: ${ask.join(" / ")}`,
  );
  assert.ok(expect.includes("purpose those must come"), `the expected answer is no longer the dashless run: ${expect.join(" / ")}`);
});

test("a verbatim answer is accepted when a standalone dash falls inside it", () => {
  const { expect } = readingProbes(DASHED);
  // What a reader who obeyed the hint would send: the source as written, dash
  // and all. Before 2026-08-18 this was refused and only the dashless form
  // passed, which is the opposite of what the hint promises.
  const verbatim = ["as a real guidance", "purpose \u2014 those must come", "here goes stale behind."].join("; ");
  assert.deepEqual(probesMissed(expect, verbatim), [], "a verbatim answer was refused over punctuation the probe itself dropped");
});

test("punctuation the probe never counted cannot fail an answer", () => {
  const { expect } = readingProbes(DASHED);
  const peppered = expect.map((e) => e.split(" ").join(" \u2014 ")).join("\n\n");
  assert.deepEqual(probesMissed(expect, peppered), [], "standalone punctuation between the right words was read as a wrong answer");
});

test("a genuinely wrong answer is still refused after the filter loosens", () => {
  const { expect } = readingProbes(DASHED);
  assert.equal(probesMissed(expect, "— — — ...").length, expect.length, "punctuation alone passed for an answer");
});

// AN ANCHOR THAT APPEARS TWICE HAS TWO RIGHT ANSWERS (i15 walk, 2026-08-19).
//
// front-desk.md carried "at the end of the" twice — "closes at the end of the
// day, not at the end of the fix". The probe quoted it, the reader answered
// past the FIRST occurrence, and the whole document came back. Nothing about
// that answer was careless; the question had not decided which one it meant.
//
// THE FIXTURE IS BUILT, NOT WRITTEN, because the probe sits at a FRACTION of
// the document. Hand-writing prose whose 30% mark lands on a repeated phrase
// is guesswork that stops reproducing the moment a word is added.

/** A document whose 30% probe anchor is a run planted earlier as well. */
function withRepeatedAnchor(): string {
  const n = 120;
  const w = Array.from({ length: n }, (_, k) => `word${k}`);
  const phrase = ["at", "the", "end", "of"];
  const at30 = Math.floor(n * 0.3);
  const earlier = Math.floor(n * 0.1);
  for (let k = 0; k < phrase.length; k++) {
    w[at30 + k] = phrase[k];
    w[earlier + k] = phrase[k];
  }
  return w.join(" ");
}

/** How many times the run a probe quoted appears in the document. */
function anchorHits(doc: string, ask: string): number {
  const quoted = /FOLLOW "([^"]*)"/.exec(ask)?.[1];
  assert.ok(quoted !== undefined, `a probe asked without quoting an anchor: ${ask}`);
  const words = readingWords(doc).map((x) => x.toLowerCase());
  const seq = readingWords(quoted).map((x) => x.toLowerCase());
  let hits = 0;
  for (let i = 0; i + seq.length <= words.length; i++) if (seq.every((s, k) => words[i + k] === s)) hits++;
  return hits;
}

test("a probe never quotes a run the document carries twice", () => {
  const doc = withRepeatedAnchor();
  for (const ask of readingProbes(doc).ask) {
    assert.equal(anchorHits(doc, ask), 1, `the anchor in "${ask}" is not unique — the question has more than one right answer`);
  }
});

test("the honest reader's answer still satisfies every probe when an anchor grew", () => {
  const doc = withRepeatedAnchor();
  const { expect } = readingProbes(doc);
  assert.deepEqual(probesMissed(expect, proofFor(doc)), [], "growing the anchor moved what the answer must contain");
});
