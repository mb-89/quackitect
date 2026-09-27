// The size cap: one answer of the pull reaches the model whole, and a hand-out
// past the margin splits, so the next pull on the same step prints the rest.
// [[spec/design_input/level-two#the-size-cap]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
import { at, doors, HOLD, heard, ROOT, standing } from "./pull-doors.js";

const TREE = join(import.meta.dirname, "..", "..");
const tracked = (path) => JSON.parse(readFileSync(join(TREE, path), "utf8"));

// A note long enough to carry the hand-out past a small cap. [[spec/design_input/level-two#the-size-cap]]
const RULES = Array.from(
  { length: 40 },
  (_, i) => `${i + 1}. Rule ${i + 1} says what the hand does next.`,
).join("\n");
const LONG = `---\nkind: [[guidance]]\n---\n\n# Actionables\n\n${RULES}\n`;
const CAP = { bytes: 1200, margin: 200 };
const bytes = (text) => Buffer.byteLength(text, "utf8");

// [[spec/design_input/level-two#the-size-cap]]
test("the config names the cap and its margin, and the schema declares both", () => {
  const said = tracked("spec/config/level0.json");
  const schema = tracked("spec/config/level0.schema.json");
  assert.equal(typeof said.pull?.cap, "number");
  assert.equal(typeof said.pull?.margin, "number");
  assert.ok(said.pull.margin < said.pull.cap, "the margin stands below the cap");
  const declared = schema.properties?.pull?.properties ?? {};
  assert.equal(declared.cap?.type, "number");
  assert.equal(declared.margin?.type, "number");
});

// [[spec/design_input/level-two#the-size-cap]]
test("a hand-out past the margin splits, and the next pull on the same step prints the rest", () => {
  const { it, disk } = doors(standing(), {}, { cap: CAP });
  disk.write(at("spec/guidance/voice.md"), LONG);

  const first = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(first.code, 0);
  assert.ok(
    bytes(first.said) <= CAP.bytes - CAP.margin,
    "the first part stays under the margin",
  );
  assert.match(first.said, /^work {2}a-child at design\/draft/);
  assert.match(first.said, /ticket pull\b.*for the rest/);
  assert.ok(JSON.parse(disk.read(HOLD)).rest, "the hold carries the rest");

  const parts = [first.said];
  for (let i = 0; i < 10 && JSON.parse(disk.read(HOLD)).rest; i++) {
    const next = heard(() => pulling(ROOT, ["pull"], it));
    assert.equal(next.code, 0);
    assert.ok(
      bytes(next.said) <= CAP.bytes - CAP.margin,
      "each part stays under the margin",
    );
    parts.push(next.said);
  }
  const whole = parts.join("\n");
  assert.ok(parts.length > 1, "the hand-out splits");
  assert.match(whole, /40\. Rule 40 says what the hand does next\./);
  assert.match(whole, /ticket pull a-child --pass/);
  const hold = JSON.parse(disk.read(HOLD));
  assert.equal(hold.step, "design/draft", "the step stays whole");

  const after = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(after.code, 1);
  assert.match(after.said, /a-child stands in your hand at design\/draft/);
});

// [[spec/design_input/level-two#the-size-cap]]
test("a hand-out under the margin prints whole, and the hold carries no rest", () => {
  const { it, disk } = doors(standing(), {}, { cap: CAP });
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0);
  assert.doesNotMatch(said, /for the rest/);
  assert.equal(JSON.parse(disk.read(HOLD)).rest, undefined);
});
