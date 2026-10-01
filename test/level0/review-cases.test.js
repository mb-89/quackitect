// The review case table answers as the bridge answers it: the reader's prompt,
// the reading of its answer, and the report on agent answered. The hooks door
// answers the same table.
// [[spec/tickets/review-spawns-off-the-door]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readerAsks, readerSays } from "../../.claude/skills/level0/lib/review.js";
import { onAgentAnswered } from "../../src/bridge/review.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import TABLE from "../../src/modules/hooks/review/testdata/review-cases.json" with {
  type: "json",
};

const TOKEN = "review-1";

// [[spec/tickets/review-spawns-off-the-door]]
test("the reader's prompt reads as the table holds it", () => {
  assert.equal(readerAsks(TABLE.material, TABLE.rules), TABLE.asks);
});

for (const one of TABLE.says) {
  // [[spec/tickets/review-spawns-off-the-door]]
  test(`the reader's answer reads as the table holds it: ${one.name}`, () => {
    assert.deepEqual(readerSays(one.text), one.read);
  });
}

for (const one of TABLE.answered) {
  // [[spec/tickets/review-spawns-off-the-door]]
  test(`the bridge answers agent answered as the table holds it: ${one.name}`, () => {
    const material = { ...TABLE.material, check: one.check, retro: one.retro };
    const box = {
      reviews: new Map([[TOKEN, material]]),
      log: fakeLog(fakeClock(), { level: "debug" }),
    };
    const said = onAgentAnswered({ ...one.e, token: TOKEN }, box);
    assert.equal(said.result.result, one.report);
    assert.equal(box.reviews.size, 0, "the token reads once");
  });
}

// [[spec/tickets/review-spawns-off-the-door]]
test("a token nobody holds answers the bridge's line", () => {
  const box = { reviews: new Map(), log: fakeLog(fakeClock(), { level: "debug" }) };
  assert.equal(
    onAgentAnswered({ token: "review-0" }, box).result.result,
    "the reader answered a review nobody asked for",
  );
});
