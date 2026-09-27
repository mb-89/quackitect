// The three-way merge of a ticket's front: a key each side adds, the entries
// each side appends to the record, and a key both sides change apart.
// [[spec/design_output/work#a-conflicted-front-resolves-itself]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { mergedFront } from "../../src/engine/front-merge.js";

const BODY = "---\n\n# Ask\n\nOne thing.\n";
const note = (...rows) => `---\n${rows.join("\n")}\n${BODY}`;
const ENTRY = (step) => [`  - step: ${step}`, "    hand: agent"];
const BASE = note("kind: [[ticket]]", "state: open", "record:", ...ENTRY("sync"));

const MINE = note(
  "kind: [[ticket]]",
  "state: open",
  "record:",
  ...ENTRY("sync"),
  ...ENTRY("split"),
);
const TRUNK = note(
  "kind: [[ticket]]",
  "state: open",
  "record:",
  ...ENTRY("sync"),
  ...ENTRY("trunk-step"),
  "cloud: true",
);

test("each side's key and each side's record entries merge, the branch's entries first", () => {
  const said = mergedFront(BASE, MINE, TRUNK);
  assert.equal(
    said.text,
    note(
      "kind: [[ticket]]",
      "state: open",
      "record:",
      ...ENTRY("sync"),
      ...ENTRY("split"),
      ...ENTRY("trunk-step"),
      "cloud: true",
    ),
  );
});

test("a key both sides change apart stays for a hand", () => {
  const mine = MINE.replace("state: open", "state: closed");
  const trunk = TRUNK.replace("state: open", "state: draft");
  assert.deepEqual(mergedFront(BASE, mine, trunk), { clash: ["state"] });
});

test("a record one side rewrites stays for a hand", () => {
  const trunk = TRUNK.replace("step: sync", "step: other");
  assert.deepEqual(mergedFront(BASE, MINE, trunk), { clash: ["record"] });
});

test("a text past the front both sides change apart stays for a hand", () => {
  const trunk = TRUNK.replace("One thing.", "Two things.");
  const mine = MINE.replace("One thing.", "Three things.");
  assert.deepEqual(mergedFront(BASE, mine, trunk), {
    clash: ["the text past the front"],
  });
});
