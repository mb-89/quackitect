// The hook's door road carries a spawn the door answers: the helper runs, and
// its answer goes back to the door, whose step stands as the call's answer.
// [[spec/tickets/review-spawns-off-the-door]]

import assert from "node:assert/strict";
import test from "node:test";
import { register as level0 } from "../../.claude/skills/level0/hooks/level0.ts";
import { TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const STUB = "/stub";
const HOOK = "http://127.0.0.1:7001/hook";
const SPAWN = {
  prompt: "read the branch",
  description: "read work/a-group",
  subagentType: "general-purpose",
};
const BACK = { event: "agent.answered", token: "review-1" };

// A box whose cage reads new, whose hooks door names its port, and whose door answers the spawn and then the report. [[spec/tickets/review-spawns-off-the-door]]
function caged() {
  const files = fakeDisk({
    [`${STUB}/.se/.runtime/hooks.json`]: JSON.stringify({ port: 7001, token: "t0k" }),
    [`${STUB}/${TRACKED}`]: JSON.stringify({ migration: { cage: "new" } }),
    [`${STUB}/.se/.log/session.jsonl`]: "",
  });
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : `${STUB}/${rel}`);
  const posts = [];
  const spawned = [];
  const $ = {
    ui: { log: () => {} },
    fs: {
      read: async (rel) => files.read(at(rel)),
      exists: async (rel) => files.exists(at(rel)),
      write: async (rel, text) => files.write(at(rel), text),
    },
    process: { run: async () => ({ exitCode: 0, stdout: "", stderr: "" }) },
    agent: {
      spawn: async (asked) => {
        spawned.push(asked);
        return { text: "the reader's answer" };
      },
    },
    http: {
      fetch: async (url, init) => {
        const body = JSON.parse(init.body);
        posts.push({ url, body });
        const effects =
          body.event === BACK.event
            ? [{ kind: "result", result: { result: "the report" } }]
            : [{ kind: "result", result: { spawn: SPAWN, back: BACK } }];
        return { ok: true, status: 200, text: JSON.stringify({ effects }) };
      },
    },
  };
  const hooks = {};
  level0((event, fn) => {
    hooks[event] = fn;
  }, {});
  const handed = Object.assign(async (e) => ({ handed: e }), { event: "tool.call" });
  return { $, hooks, handed, posts, spawned };
}

// [[spec/tickets/review-spawns-off-the-door]]
test("under new a door's spawn answer spawns the helper, and the back post goes to the door", async () => {
  const box = caged();

  const said = await box.hooks["*"](
    box.$,
    { tool: "mcp__level0__review_branch", branch: "work/a-group" },
    box.handed,
  );

  assert.deepEqual(box.spawned, [SPAWN], "the helper spawns as the door asks");
  assert.equal(box.posts.length, 2);
  assert.equal(box.posts[1].url, HOOK, "the back post goes to the door");
  assert.equal(box.posts[1].body.event, BACK.event);
  assert.equal(box.posts[1].body.e.token, BACK.token, "under the token the door named");
  assert.equal(box.posts[1].body.e.text, "the reader's answer");
  assert.deepEqual(
    said,
    { result: "the report" },
    "the door's report answers the call",
  );
});
