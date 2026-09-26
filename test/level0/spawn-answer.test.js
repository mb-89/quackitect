// The spawn answer, read as the session reads it: the lead spawns the hand
// and takes the next item while the hand works.
// [[spec/tickets/a-small-ask-stays-small]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnAnswer } from "../../src/scripts/pull-hand.js";

const OTHER = {
  one: { name: "a-child", front: {} },
  leaf: { path: "design/review", evidence: [{ name: "verdict", form: "verdict" }] },
  why: "waits for a hand other than box one",
};

function printed(run) {
  const lines = [];
  const was = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  try {
    run();
  } finally {
    console.log = was;
  }
  return lines.join("\n");
}

test("the spawn answer tells the session to spawn in the background and take the next item", () => {
  const said = printed(() => spawnAnswer(OTHER));

  assert.match(said, /^spawn\n/, "the answer opens on its word");
  assert.match(said, /in the background/, "the hand runs in the background");
  assert.match(said, /take the next item/, "the lead takes the next item");
  assert.match(said, /helper-1/, "the prompt names its hand");
});
