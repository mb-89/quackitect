// The dry probe's pure half: the engine it raises a session's events through,
// and the checks it reads off what the run leaves.
// [[spec/tickets/level0-runs-whole-on-the-door]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { DRY, engineOf, readsDry } from "../../src/scripts/probe-dry.js";

const SENTENCE = "level0 holds this session: 75 rules, 6 notes, the stop hook on.";

// What a whole run leaves: the door stands, the context hands the canary, the prompt reads rewritten, the tools register, the read passes and the guarded call comes back refused. [[spec/tickets/level0-runs-whole-on-the-door]]
function whole() {
  return {
    rows: [
      { kind: "context", said: "2 block(s) reach the session" },
      { kind: "level0", said: HEARD.same, detail: SENTENCE },
    ],
    seen: {
      door: true,
      blocks: [
        { name: "level0-tools", text: "the tools" },
        { name: "level0-canary", text: `Open your FIRST answer with:\n\n    ${SENTENCE}` },
      ],
      sentence: SENTENCE,
      prompt: { text: "probe" },
      submitted: { text: "Answer first.\n\nprobe" },
      registered: ["pull", "find", "stop"],
      read: { passed: { tool: "Read" } },
      guarded: { deny: "The door wants a ticket name opening the description." },
      posts: [{ url: "http://127.0.0.1:7001/hook", event: "session.start" }],
      said: [],
    },
  };
}

const failing = (rows, seen) =>
  readsDry(rows, seen)
    .filter((one) => !one.pass)
    .map((one) => one.check);

test("a whole run passes every check the dry probe names", () => {
  const { rows, seen } = whole();
  const checks = readsDry(rows, seen);
  assert.deepEqual(
    checks.map((one) => one.check),
    DRY.checks,
  );
  assert.deepEqual(failing(rows, seen), []);
});

test("a context read handing no canary block fails the rules", () => {
  const { rows, seen } = whole();
  assert.deepEqual(failing(rows, { ...seen, blocks: [], sentence: "" }), ["rules"]);
});

test("a prompt the client reads as given fails the prompt check", () => {
  const { rows, seen } = whole();
  assert.deepEqual(failing(rows, { ...seen, submitted: { text: "probe" } }), ["prompt"]);
});

test("the pull alone fails the tools check", () => {
  const { rows, seen } = whole();
  assert.deepEqual(failing(rows, { ...seen, registered: ["pull"] }), ["tools"]);
});

test("a guarded call that passes, or a refusal saying level zero answers nothing, fails the guard", () => {
  const { rows, seen } = whole();
  assert.deepEqual(failing(rows, { ...seen, guarded: { passed: {} } }), ["guard"]);
  assert.deepEqual(
    failing(rows, {
      ...seen,
      guarded: { deny: "Level zero refuses Bash: the index answers nothing" },
    }),
    ["guard"],
  );
});

test("a post past the hooks door, or a line saying level zero answers nothing, fails quiet", () => {
  const { rows, seen } = whole();
  assert.deepEqual(
    failing(rows, {
      ...seen,
      posts: [{ url: "http://127.0.0.1:6510/event", event: "env.get" }],
    }),
    ["quiet"],
  );
  assert.deepEqual(
    failing(rows, { ...seen, said: ["LEVEL ZERO ANSWERS NOTHING. The server"] }),
    ["quiet"],
  );
});

test("a door that never stood, and a canary nobody heard, fail their checks", () => {
  const { rows, seen } = whole();
  assert.deepEqual(failing(rows, { ...seen, door: false }), ["door"]);
  assert.deepEqual(failing([rows[0]], seen), ["canary"]);
});

test("the engine wraps each registration around the ones after it, reads a filter, and keeps a stream to its own", async () => {
  const order = [];
  const engine = engineOf((on) => {
    on("*", async ($, e, next) => {
      order.push(`all:${next.event}`);
      return next({ ...e, seen: true });
    });
    on("tool.call", { tool: "pull" }, async () => ({ result: "pulled" }));
    on("turn.step", async function* ($, e, next) {
      for await (const one of next(e)) yield { ...one, through: true };
    });
  });

  const read = await engine.raise({}, "tool.call", { tool: "Read" }, async (e) => ({
    passed: e,
  }));
  const pulled = await engine.raise({}, "tool.call", { tool: "pull" }, async () => ({}));
  const origin = { kind: "composer" };
  let heard;
  await engine.raise({}, "prompt.submit", {}, async () => ({}), origin);
  await engineOf((on) =>
    on("*", async (_$, e, next) => {
      heard = next.origin;
      return next(e);
    }),
  ).raise({}, "prompt.submit", {}, async () => ({}), origin);
  const chunks = [];
  for await (const one of engine.raise({}, "turn.step", {}, async function* () {
    yield { kind: "text" };
  }))
    chunks.push(one);

  assert.deepEqual(read, { passed: { tool: "Read", seen: true } });
  assert.deepEqual(pulled, { result: "pulled" });
  assert.deepEqual(heard, origin, "the origin rides the next a hook reads");
  assert.deepEqual(chunks, [{ kind: "text", through: true }]);
  assert.deepEqual(order, ["all:tool.call", "all:tool.call", "all:prompt.submit"]);
});
