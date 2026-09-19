// The bridgehead answering a vote and a hand in one call. The stop door votes
// and starts the refactoring hand together, so this drives both out of one
// answer over a fake session.
// [[spec/tickets/the-spawn-reaches-its-guidance]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { besides } from "../../.claude/skills/level0/hooks/level0.js";

function session(said = { text: "the hand is done" }) {
  const spawned = [];
  const posted = [];
  return {
    spawned,
    posted,
    $: {
      agent: { spawn: (one) => void spawned.push(one) || said },
      http: {
        fetch: (_where, init) => {
          posted.push(JSON.parse(init.body));
          return { ok: true, status: 200, text: "{}" };
        },
      },
    },
  };
}

const HAND = { prompt: "drain old.md", description: "drain", kind: "refactor" };

test("the hand runs, and the vote stands as the answer", async () => {
  const it = session();
  const said = await besides(
    it.$,
    { result: { block: "carry on" }, spawn: HAND, back: { event: "refactor.answered", file: "old.md" } },
    {},
    () => ({ pass: true }),
  );

  assert.deepEqual(said, { block: "carry on" });
  assert.deepEqual(it.spawned, [HAND]);
  assert.equal(it.posted[0].event, "refactor.answered");
  assert.equal(it.posted[0].e.file, "old.md");
  assert.equal(it.posted[0].e.text, "the hand is done");
});

test("an answer holding the turn open runs the hand and passes the event on", async () => {
  const it = session();
  const e = { last_assistant_message: "text" };
  const said = await besides(it.$, { pass: true, spawn: HAND }, e, (one) => ({ saw: one }));

  assert.deepEqual(said, { saw: e });
  assert.deepEqual(it.spawned, [HAND]);
});

test("a refused spawn leaves the vote whole", async () => {
  const it = session();
  it.$.agent.spawn = () => {
    throw new Error("no hand here");
  };
  const said = await besides(it.$, { result: { block: "carry on" }, spawn: HAND }, {}, () => ({}));

  assert.deepEqual(said, { block: "carry on" });
  assert.equal(it.posted[0].e.deny, "no hand here");
});
