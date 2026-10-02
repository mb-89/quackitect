// The hook's door road runs the clear a door answer carries: the event goes
// on, the conversation clears, and the resume prompt opens the next turn.
// The client refuses a command inside a hook the turn waits on, so the clear
// runs on a timer, past the hook.
// [[spec/tickets/clear-answers-off-the-door]] [[spec/tickets/the-clear-continues-the-session]]

import assert from "node:assert/strict";
import test from "node:test";
import { register as level0 } from "../../.claude/skills/level0/hooks/level0.js";
import { TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const STUB = "/stub";
const RESUME = "Run ./RUNME.sh ticket pull.";

// A box whose cage reads new, and whose door answers every post with a clear. [[spec/tickets/clear-answers-off-the-door]]
function caged() {
  const files = fakeDisk({
    [`${STUB}/.se/.runtime/hooks.json`]: JSON.stringify({ port: 7001, token: "t0k" }),
    [`${STUB}/${TRACKED}`]: JSON.stringify({ migration: { cage: "new" } }),
    [`${STUB}/.se/.log/session.jsonl`]: "",
  });
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : `${STUB}/${rel}`);
  const commands = [];
  const prompts = [];
  const timers = [];
  const hook = { open: false };
  const idle = (call) => {
    if (hook.open) throw new Error(`${call} rejects inside a hook the turn is waiting on`);
  };
  const $ = {
    ui: { log: () => {} },
    fs: {
      read: async (rel) => files.read(at(rel)),
      exists: async (rel) => files.exists(at(rel)),
      write: async (rel, text) => files.write(at(rel), text),
    },
    process: { run: async () => ({ exitCode: 0, stdout: "", stderr: "" }) },
    command: {
      run: async (asked) => {
        idle("command.run");
        commands.push(asked);
      },
    },
    prompt: {
      submit: async (asked) => {
        idle("prompt.submit");
        prompts.push(asked);
      },
    },
    clock: { after: (_ms, fn) => void timers.push(fn) },
    http: {
      fetch: async () => {
        const effects = [{ kind: "clear", text: RESUME }];
        return { ok: true, status: 200, text: JSON.stringify({ effects }) };
      },
    },
  };
  const hooks = {};
  level0((event, fn) => {
    hooks[event] = fn;
  }, {});
  const handed = Object.assign(async (e) => ({ handed: e }), { event: "tool.call" });
  return { $, hooks, handed, commands, prompts, timers, hook };
}

// [[spec/tickets/clear-answers-off-the-door]]
test("under new a door answer carrying a clear runs the clear, and the resume prompt follows", async () => {
  const box = caged();
  const e = { tool: "Bash", command: "ls" };

  box.hook.open = true;
  const said = await box.hooks["*"](box.$, e, box.handed);
  box.hook.open = false;
  assert.deepEqual(box.commands, [], "nothing runs inside the hook");
  for (const fn of box.timers) await fn();

  assert.deepEqual(box.commands, [{ command: "clear" }], "the conversation clears");
  assert.deepEqual(
    box.prompts,
    [{ text: RESUME }],
    "and the resume prompt opens the next turn",
  );
  assert.deepEqual(said, { handed: e }, "the event goes on");
});

// [[spec/tickets/the-clear-runs-live-remote]]
test("a clear the Stop answers waits for the turn's completion, runs inside it, and the timer runs nothing more", async () => {
  const box = caged();
  const stop = Object.assign(async () => ({}), { event: "classic.Stop" });
  const ends = Object.assign(async () => ({ text: "done" }), { event: "turn.complete" });

  box.hook.open = true;
  await box.hooks["*"](box.$, {}, stop);
  box.hook.open = false;
  assert.deepEqual(box.commands, [], "nothing runs inside the Stop");
  const said = await box.hooks["turn.complete"](box.$, { reason: "answer" }, ends);
  for (const fn of box.timers) await fn();

  assert.deepEqual(box.commands, [{ command: "clear" }], "the conversation clears once");
  assert.deepEqual(box.prompts, [{ text: RESUME }], "and the resume prompt opens the next turn");
  assert.deepEqual(said, { text: "done" }, "the turn's completion answers as before");
});
