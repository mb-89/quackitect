// The config a door asks: the tracked file at the method root, and the local
// file at the work root over it.
// [[spec/design_output/config#the-three-layers]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCAL, TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { asks, writes } from "../../src/bridge/config.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const boxOf = (seed) => ({
  disk: fakeDisk(seed),
  method: "/method",
  work: "/work",
});

test("the tracked file answers a key the local file leaves out", () => {
  const box = boxOf({ [`/method/${TRACKED}`]: '{"names":{"words":5}}' });

  assert.equal(asks(box, "names.words"), 5);
});

test("the local file beats the tracked one", () => {
  const box = boxOf({
    [`/method/${TRACKED}`]: '{"names":{"words":5}}',
    [`/work/${LOCAL}`]: '{"names":{"words":8}}',
  });

  assert.equal(asks(box, "names.words"), 8);
});

test("a write lands in the local file and reads back", () => {
  const box = boxOf({ [`/method/${TRACKED}`]: '{"names":{"words":5}}' });

  writes(box, "names.words", 9);

  assert.equal(asks(box, "names.words"), 9);
  assert.match(box.disk.read(`/work/${LOCAL}`), /"words": 9/);
});

test("a key no layer holds answers nothing", () => {
  assert.equal(asks(boxOf({}), "names.words"), undefined);
});
