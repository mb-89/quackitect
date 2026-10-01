// The JavaScript counts against the shared brief case table, which the Go door
// reads for its canary and its debt. A drift reads here first.
// [[spec/tickets/brief-answers-off-the-door]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { canaryText, OWES } from "../../.claude/skills/level0/lib/guidance.js";
import { guidanceHere } from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import TABLE from "../replay/cage/brief-cases.json" with { type: "json" };

const ROOT = "/tree";

// The row's notes on a fake disk under one root, as a desk reads them. [[spec/tickets/brief-answers-off-the-door]]
function diskOf(one) {
  return fakeDisk(
    Object.fromEntries(
      Object.entries(one.files).map(([path, text]) => [`${ROOT}/${path}`, text]),
    ),
  );
}

for (const one of TABLE.cases) {
  test(`the JavaScript counts match the case table: ${one.name}`, () => {
    const held = guidanceHere(diskOf(one), ROOT, ROOT, {}, one.stop);
    assert.equal(held.rules, one.rules);
    assert.equal(held.notes, one.notes);
    assert.equal(held.sentence, one.sentence);
    assert.equal(canaryText(held.sentence), one.canary);
    assert.equal(OWES.warns(held.sentence), one.owes);
  });
}
