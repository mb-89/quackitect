// The block a session outside the cage reads: the bridgehead says the start
// road stood down, and a box whose server answers says nothing of its own.
// [[spec/design_output/level0#a-session-says-its-cage]]

import assert from "node:assert/strict";
import { test } from "node:test";

const HERE = "/tree";
const NO_MODULES = 6;

// A fresh copy of the hook a case, because the bridgehead holds what the start road answered. [[spec/design_output/level0#a-session-says-its-cage]]
let made = 0;
async function hookHere() {
  made += 1;
  return import(`../../.claude/skills/level0/hooks/level0.js?case=${made}`);
}

// The harness the bridgehead reaches: a wire, a file system and a process. [[spec/design_output/doors#a-fake-behaves]]
function harness({ answers = false, exitCode = 0, stderr = "" } = {}) {
  const wrote = new Map();
  return {
    wrote,
    $: {
      http: {
        fetch: async () => {
          if (!answers) throw new Error("fetch failed");
          return { ok: true, status: 200, text: JSON.stringify({ pass: true }) };
        },
      },
      fs: {
        read: async (path) => {
          if (!wrote.has(path)) throw new Error("no file");
          return wrote.get(path);
        },
        write: async (path, text) => void wrote.set(path, text),
      },
      process: { run: async () => ({ exitCode, stderr }) },
    },
  };
}

async function opensThen(hook, box, e) {
  const held = {};
  hook.register((event, ...rest) => {
    held[event] = rest.at(-1);
  }, {});
  const star = held["*"];
  const runs = (event, said) =>
    star(
      box.$,
      said,
      Object.assign(async (back) => back ?? {}, { event }),
    );
  await runs("session.start", { cwd: HERE });
  return runs("prompt.context", e ?? {});
}

test("a box whose start road stands down says so in the first prompt", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: NO_MODULES, stderr: "npm stands nowhere" });
  const said = await opensThen(hook, box);

  const block = (said.blocks ?? []).find((one) => one.name === hook.CAGE_BLOCK);
  assert.ok(block, "the first prompt carries the cage block");
  assert.match(block.text, /LEVEL ZERO STANDS DOWN/);
  assert.match(block.text, new RegExp(String(NO_MODULES)), "it names the code");
  assert.match(block.text, /npm stands nowhere/, "and what the road says");
  assert.match(block.text, /RUNME\.sh serve/, "and what a person runs");
});

test("a box whose server answers says no block of its own", async () => {
  const hook = await hookHere();
  const box = harness({ answers: true });
  const said = await opensThen(hook, box);
  assert.equal(
    (said.blocks ?? []).some((one) => one.name === hook.CAGE_BLOCK),
    false,
  );
});

test("a code saying a person starts the server carries no block", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 3 });
  const said = await opensThen(hook, box);
  assert.equal(
    (said.blocks ?? []).some((one) => one.name === hook.CAGE_BLOCK),
    false,
    "a person standing at the box reads the sidebar",
  );
});

test("the block names the code, what it means, and what a person runs", async () => {
  const hook = await hookHere();
  const said = hook.cageText(NO_MODULES, "");
  assert.match(said, new RegExp(hook.reasonOf(NO_MODULES)[1]));
  assert.match(said, /RUNME\.sh/);
});
