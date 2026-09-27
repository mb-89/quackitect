// The pull tool meets a spawn answer: it spawns the hand in the background
// once, and hands the answer back so the lead takes the next item.
// [[spec/tickets/the-hook-awaits-the-spawn]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/pull-tool.js";
import { PULL_CALL } from "../../.claude/skills/level0/lib/pull.js";

const SPAWN =
  "spawn\n  a-child at design/review waits for a hand other than box 1.\n  Spawn a hand.\n\nYou are a hand of your own, named helper-2.\n1. Run it.";

function engine() {
  const held = [];
  const ran = [];
  const spawned = [];
  const on = (event, filter, made) =>
    void held.push({ event, filter, run: made ?? filter });
  const $ = {
    tool: { register: () => {} },
    process: {
      run: async (argv) => void ran.push(argv) || { stdout: SPAWN, exitCode: 0 },
    },
    agent: { spawn: async (one) => void spawned.push(one) || { text: "started" } },
    fs: { read: async () => "", write: async () => {} },
    http: {
      fetch: () => {
        throw new Error("no server");
      },
    },
    ui: { log: () => {} },
  };
  register(on, {});
  const call = held.find(
    (one) => one.event === "tool.call" && one.filter?.tool === PULL_CALL,
  );
  return { $, call, ran, spawned };
}

test("the pull tool spawns the hand in the background once, and pulls no second time", async () => {
  const it = engine();
  const said = await it.call.run(it.$, {}, async () => ({}));

  assert.equal(it.spawned.length, 1, "one hand spawns");
  assert.equal(it.spawned[0].background, true, "the hand runs in the background");
  assert.equal(it.ran.length, 1, "the tool waits on no hand before it answers");
  assert.match(
    said.result,
    /in the background/,
    "the answer says the hand works in the background",
  );
});
