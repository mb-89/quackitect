// The ask from the sidebar: a value past quiet opens a demand, and the pay
// drops the key back to quiet by value.
// [[spec/design_output/extension#the-ask-is-a-line]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { ASK, QUIET } from "../../.claude/skills/level0/lib/controls.js";
import { dropsAsk } from "../../src/bridge/ask.js";
import { LOCAL } from "../../.claude/skills/level0/lib/config.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const boxOf = (wanted) => ({
  disk: fakeDisk(wanted ? { [`/work/${LOCAL}`]: JSON.stringify(nest(wanted)) } : {}),
  method: "/method",
  work: "/work",
  log: { say: () => {} },
});

function nest(wanted) {
  const [section, leaf] = ASK.split(".");
  return { [section]: { [leaf]: wanted } };
}

test("the pay drops the ask it stood on back to quiet", () => {
  const box = boxOf("short");

  assert.deepEqual(dropsAsk(box, "short"), { pass: true });
  assert.match(box.disk.read(`/work/${LOCAL}`), new RegExp(QUIET));
  assert.equal(box.asked, "");
});

test("an ask pressed since the demand stands, and the pay leaves it", () => {
  const box = boxOf("full");

  dropsAsk(box, "short");

  assert.match(box.disk.read(`/work/${LOCAL}`), /full/);
});

test("a quiet key takes no write", () => {
  const box = boxOf(QUIET);

  dropsAsk(box, "short");

  assert.match(box.disk.read(`/work/${LOCAL}`), new RegExp(QUIET));
});
