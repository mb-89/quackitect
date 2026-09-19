// The hand the pull reads: the box, the session on it, and the agent inside
// it where the harness names one. The hold slugs that hand into a file name,
// so a helper holds a leaf beside the session that spawned it.
// [[spec/design_output/pull#the-hand-and-the-hold]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { handOf, holdAt, roleOf } from "../../src/scripts/pull.js";

const ROOT = "/tree";
const ID = "d462e994b4cef";
const AUTHOR = "git config user.name";
const at = (path) => join(ROOT, ...path.split("/"));

function box(files = {}, more = {}) {
  return {
    root: ROOT,
    join,
    disk: fakeDisk({ [at(".se/run/box.json")]: JSON.stringify({ id: ID }), ...files }),
    git: fakeGit({ [AUTHOR]: { stdout: "Ada\n" } }, ROOT),
    clock: fakeClock(),
    ...more,
  };
}

const session = (held) => ({ [at(".se/run/session.json")]: JSON.stringify(held) });

test("the hand names the box, the session on it and the agent inside it", () => {
  const it = box(session({ id: "s7", harness: "claude-code" }), { agent: true });
  assert.equal(handOf(it), `box ${ID} · session s7 · claude-code`);
});

test("a session file naming no harness leaves the hand at the box and the session", () => {
  const it = box(session({ id: "s7" }), { agent: true });
  assert.equal(handOf(it), `box ${ID} · session s7`);
});

test("the box file alone on a harness names the agent off the environment", () => {
  const it = box({}, { agent: true, env: { CLAUDE_CODE_REMOTE: "true" } });
  assert.equal(handOf(it), `box ${ID} · claude-code-remote`);
});

// A tracked file holds no person's name, and git carries who wrote the commit. [[spec/guidance/voice]]
// [[spec/design_output/pull#the-hand-rule]]
test("the box file alone off a harness names the git author, and the record takes the role", () => {
  const it = box({}, { agent: false, env: {} });
  assert.equal(handOf(it), "person Ada");
  assert.equal(roleOf(handOf(it)), "person", "a tracked file holds no person's name");
  assert.equal(roleOf(`box ${ID}`), `box ${ID}`, "and a box's hand stands as it stands");

  const bare = box({}, { agent: false, env: {}, git: fakeGit({}, ROOT) });
  assert.equal(handOf(bare), "person", "a box naming no author reads the role alone");
});

test("a helper's hold takes a file name of its own, beside the session's", () => {
  const it = box();
  const hand = `box ${ID}`;
  assert.notEqual(
    holdAt(it, `${hand} · helper-2`),
    holdAt(it, hand),
    "two holds, two files",
  );
  assert.match(holdAt(it, `${hand} · helper-2`), /helper-2\.json$/);
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the wrapper's lib builds the session file its hook writes at session.start", async () => {
  const lib = await import("../../.claude/skills/level1/lib/pull.js");
  assert.equal(
    typeof lib.sessionOf,
    "function",
    "the lib names the session file builder",
  );
  assert.deepEqual(lib.sessionOf({ session: { id: "s7" }, harness: "claude-code" }), {
    id: "s7",
    harness: "claude-code",
  });
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the spawn hook's line names a helper as the session's own hand", async () => {
  const lib = await import("../../.claude/skills/level0/hooks/level0.js");
  assert.equal(typeof lib.spawnTagOf, "function", "the hook names the spawn tag");
  const line = lib.spawnTagOf({ id: "s7", harness: "claude-code" });
  assert.equal(line.split("\n").length, 1, "one line");
  assert.match(line, /s7/, "the line names the session");
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the registered spawn hook puts the line at the head of a helper's prompt", async () => {
  const said = await spawnsWith(
    { prompt: "work one step" },
    { id: "s7", harness: "claude-code" },
  );
  assert.match(
    said.prompt,
    /^You are the hand of session s7/,
    "the line opens the prompt",
  );
  assert.match(said.prompt, /work one step$/, "and the prompt stands under it");
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("a spawn the wrapper makes itself carries no tag", async () => {
  const said = await spawnsWith(
    { prompt: "the engine wrote this", own: true },
    { id: "s7" },
  );
  assert.equal(
    said.prompt,
    "the engine wrote this",
    "its own hand reads the prompt as written",
  );
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("a box carrying no session file leaves every prompt as written", async () => {
  const said = await spawnsWith({ prompt: "work one step" }, null);
  assert.equal(said.prompt, "work one step");
});

async function spawnsWith(e, held) {
  const { register } = await import("../../.claude/skills/level0/hooks/level0.js");
  const hooks = {};
  register((event, fn) => {
    hooks[event] = fn;
  }, {});
  const $ = {
    fs: {
      read: async () => {
        if (!held) throw new Error("no session file");
        return JSON.stringify(held);
      },
    },
  };
  return hooks["agent.spawn"]($, e, async (said) => said);
}
