// The level0 hook's door road over a fake engine: a clear the door answers
// runs past the hook and the resume prompt follows, a spawn it answers runs
// the helper and posts the answer back, and a door down hands the event to
// the hook verb's down word, installing first on a cloud box with no binary.
// [[spec/tickets/clear-answers-off-the-door]] [[spec/tickets/review-spawns-off-the-door]] [[spec/tickets/level0-hooks-forward-to-go]]

import assert from "node:assert/strict";
import test from "node:test";
import { register as level0 } from "../../.claude/skills/level0/hooks/level0.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

// The forwarder holds the session in module state, so the down cases take a module of their own. [[spec/tickets/the-tests-start-fewer-processes]]
const { register: downLevel0 } = await import(
  "../../.claude/skills/level0/hooks/level0.js?caged-door"
);

const METHOD = "/method";
const BIN = `${METHOD}/.se/.runtime/bin/se-index`;
const RESUME = "Run ./RUNME.sh ticket pull.";
const SPAWN = {
  prompt: "read the branch",
  description: "read work/a-group",
  subagentType: "general-purpose",
};
const BACK = { event: "agent.answered", token: "review-1" };
const REFUSED = "Level zero refuses Write: the index answers nothing.";
const FELL = "LEVEL ZERO ANSWERS NOTHING.";
const effects = (...some) => ({
  ok: true,
  status: 200,
  text: JSON.stringify({ effects: some }),
});

// A box whose door answers each post as the case says; a command or prompt inside an open hook refuses, as the client does. [[spec/tickets/clear-answers-off-the-door]]
function box({ answers, register = level0, binary = true, cloud = false }) {
  const files = fakeDisk({
    "/tree/.se/.runtime/hooks.json": JSON.stringify({ port: 7001, token: "t0k" }),
    "/tree/.se/.log/session.jsonl": "",
    ...(binary ? { [BIN]: "a binary" } : {}),
  });
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : `/tree/${rel}`);
  const it = {
    commands: [],
    prompts: [],
    timers: [],
    posts: [],
    spawned: [],
    runs: [],
    logged: [],
    open: false,
  };
  const idle = (call) =>
    assert.equal(it.open, false, `${call} rejects inside a hook the turn waits on`);
  it.$ = {
    ui: { log: (text) => it.logged.push(text) },
    fs: {
      read: async (rel) => files.read(at(rel)),
      exists: async (rel) => files.exists(at(rel)),
      write: async (rel, text) => files.write(at(rel), text),
    },
    env: {
      get: async (key) => (cloud && key === "CLAUDE_CODE_REMOTE" ? "1" : undefined),
    },
    session: { usage: async () => ({}), messages: async () => [] },
    process: {
      run: async (argv, init) => {
        it.runs.push({ argv, init });
        if (argv[0] === "sh") files.write(BIN, "a binary");
        if (argv[0] !== BIN) return { exitCode: 0, stdout: "", stderr: "" };
        const said = JSON.stringify({ effects: [{ kind: "result", text: REFUSED }] });
        return {
          exitCode: 0,
          stdout: said,
          stderr: `${FELL} It says: Unable to connect.`,
        };
      },
    },
    command: { run: async (asked) => idle("command.run") || it.commands.push(asked) },
    prompt: {
      submit: async (asked) => idle("prompt.submit") || it.prompts.push(asked),
    },
    clock: { after: (_ms, fn) => void it.timers.push(fn) },
    agent: {
      spawn: async (asked) => it.spawned.push(asked) && { text: "the reader's answer" },
    },
    http: {
      fetch: async (url, init) => {
        const body = JSON.parse(init.body);
        it.posts.push({ url, body });
        return answers(body);
      },
    },
  };
  it.hooks = {};
  register((event, fn) => Object.assign(it.hooks, { [event]: fn }), { method: METHOD });
  it.handed = Object.assign(async (e) => ({ handed: e }), { event: "tool.call" });
  it.inside = async (run) => {
    it.open = true;
    const said = await run();
    it.open = false;
    return said;
  };
  return it;
}
const clears = () => effects({ kind: "clear", text: RESUME });

test("a clear the door answers runs past the hook, and the resume prompt opens the next turn", async () => {
  const it = box({ answers: clears });
  const e = { tool: "Bash", command: "ls" };
  const said = await it.inside(() => it.hooks["*"](it.$, e, it.handed));
  assert.deepEqual(it.commands, [], "nothing runs inside the hook");
  for (const fn of it.timers) await fn();
  assert.deepEqual(
    [it.commands, it.prompts],
    [[{ command: "clear" }], [{ text: RESUME }]],
  );
  assert.deepEqual(said, { handed: e }, "the event goes on");
});

// [[spec/tickets/the-clear-runs-live-remote]]
test("a clear the Stop answers runs inside the turn's completion, and the timer runs nothing more", async () => {
  const it = box({ answers: clears });
  const stop = Object.assign(async () => ({}), { event: "classic.Stop" });
  const ends = Object.assign(async () => ({ text: "done" }), {
    event: "turn.complete",
  });
  await it.inside(() => it.hooks["*"](it.$, {}, stop));
  assert.deepEqual(it.commands, [], "nothing runs inside the Stop");
  const said = await it.hooks["turn.complete"](it.$, { reason: "answer" }, ends);
  for (const fn of it.timers) await fn();
  assert.deepEqual(
    [it.commands, it.prompts],
    [[{ command: "clear" }], [{ text: RESUME }]],
  );
  assert.deepEqual(said, { text: "done" });
});

test("a spawn the door answers runs the helper, and its answer goes back under the door's token", async () => {
  const answers = (body) =>
    effects({
      kind: "result",
      result:
        body.event === BACK.event
          ? { result: "the report" }
          : { spawn: SPAWN, back: BACK },
    });
  const it = box({ answers });
  const said = await it.hooks["*"](
    it.$,
    { tool: "mcp__level0__review_branch", branch: "work/a-group" },
    it.handed,
  );
  assert.deepEqual(it.spawned, [SPAWN]);
  assert.equal(it.posts.length, 2);
  const { url, body } = it.posts[1];
  assert.deepEqual(
    [url, body.event, body.e.token, body.e.text],
    ["http://127.0.0.1:7001/hook", BACK.event, BACK.token, "the reader's answer"],
  );
  assert.deepEqual(
    said,
    { result: "the report" },
    "the door's report answers the call",
  );
});

test("a door down runs the down word and hands its answer on, installing first on a cloud box with no binary", async () => {
  const down = () => {
    throw new Error("Unable to connect");
  };
  const it = box({ answers: down, register: downLevel0 });
  const call = { tool: "Write", file_path: "spec/a.md", content: "x" };
  assert.deepEqual(await it.hooks["*"](it.$, call, it.handed), { deny: REFUSED });
  assert.deepEqual(
    it.runs.map((one) => one.argv),
    [[BIN, "verb", `${METHOD}/src/scripts`, "hook", "down", "tool.call"]],
  );
  assert.deepEqual(
    JSON.parse(it.runs[0].init.stdin),
    call,
    "with the event's fields on its input",
  );
  assert.match(
    String(it.logged[0] ?? ""),
    /^LEVEL ZERO ANSWERS NOTHING\./,
    "its fall line reaches the person",
  );

  const bare = box({ answers: down, register: downLevel0, binary: false, cloud: true });
  assert.deepEqual(
    await bare.hooks["*"](
      bare.$,
      { tool: "Write", file_path: "spec/a.md" },
      bare.handed,
    ),
    { deny: REFUSED },
  );
  assert.deepEqual(
    bare.runs.map((one) => one.argv[0]),
    ["sh", BIN],
  );
  assert.deepEqual(bare.runs[0].argv, ["sh", `${METHOD}/install.sh`]);
});
