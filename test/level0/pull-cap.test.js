// The size cap: one answer of the pull reaches the model whole, and a hand-out
// past the margin splits, so the next pull on the same step prints the rest.
// [[spec/design_input/level-two#the-size-cap]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { underBuiltIns } from "../../.claude/skills/level0/lib/config.js";
import file from "../../spec/config/level0.json" with { type: "json" };
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { partOf } from "../../src/scripts/pull-cap.js";
import { stillHeld } from "../../src/scripts/pull-route.js";
import { pulling } from "../../src/scripts/work.js";
import { at, doors, HOLD, heard, ROOT, standing } from "./pull-doors.js";

// A note long enough to carry the hand-out past a small cap. [[spec/design_input/level-two#the-size-cap]]
const RULES = Array.from(
  { length: 40 },
  (_, i) => `${i + 1}. Rule ${i + 1} says what the hand does next.`,
).join("\n");
const LONG = `---\nkind: [[guidance]]\n---\n\n# Actionables\n\n${RULES}\n`;
const said = underBuiltIns(schema, file);
const CAP = { bytes: 1200, margin: 200 };
const bytes = (text) => Buffer.byteLength(text, "utf8");

// [[spec/design_input/level-two#the-size-cap]]
test("the config names the cap and its margin, and the schema declares both", () => {
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
test("a line longer than the room cuts at a character, and the parts join to the whole", () => {
  const line = "é".repeat(50);
  const { head, rest } = partOf(line, 11);
  assert.ok(bytes(head) <= 11);
  assert.equal(head + rest, line);
});

// [[spec/design_input/level-two#the-size-cap]]
test("a refusal reprinting the notes stays under the margin, and names the verb printing them whole", () => {
  const { it, disk } = doors(standing(), {}, { cap: CAP });
  disk.write(at("spec/guidance/voice.md"), LONG);
  heard(() => pulling(ROOT, ["pull"], it));
  for (let i = 0; i < 10 && JSON.parse(disk.read(HOLD)).rest; i++)
    heard(() => pulling(ROOT, ["pull"], it));
  disk.write(at("spec/guidance/voice.md"), LONG.replace("Rule 1 ", "Rule one "));
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 1);
  assert.ok(bytes(said) <= CAP.bytes - CAP.margin);
  assert.match(said, /branch guidance/);
});

// [[spec/design_input/level-two#the-size-cap]]
test("a hand-out under the margin prints whole, and the hold carries no rest", () => {
  const { it, disk } = doors(standing(), {}, { cap: CAP });
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0);
  assert.doesNotMatch(said, /for the rest/);
  assert.equal(JSON.parse(disk.read(HOLD)).rest, undefined);
});

// [[spec/design_input/level-two#the-size-cap]]
test("stillHeld prints the rest a hold carries, and drops it from the hold", () => {
  const { it, disk } = doors({}, {}, { cap: CAP, root: ROOT });
  const hold = {
    ticket: "a-child",
    step: "design/draft",
    hand: "box d462e994b4cef",
    rest: "the rest of it",
  };
  const { code, said } = heard(() => stillHeld(it, hold));
  assert.equal(code, 0);
  assert.equal(said, "the rest of it");
  assert.equal(JSON.parse(disk.read(HOLD)).rest, undefined);
});
