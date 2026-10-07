// The forwarder's road where the hooks door answers nothing: the hook verb's
// down word answers in its place, and a cloud box carrying no binary installs
// first. [[spec/tickets/level0-hooks-forward-to-go]]

import assert from "node:assert/strict";
import test from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";

// The forwarder holds the session in module state, so these cases take a module of their own. [[spec/tickets/the-tests-start-fewer-processes]]
const { register } = await import("../../.claude/skills/level0/hooks/level0.js?caged-door");

const METHOD = "/method";
const BIN = `${METHOD}/.se/.runtime/bin/se-index`;
const REFUSED = "Level zero refuses Write: the index answers nothing.";
const FELL = "LEVEL ZERO ANSWERS NOTHING.";

// A box whose door falls on every post, and whose down word answers a refusal on its error stream's fall line. [[spec/tickets/level0-hooks-forward-to-go]]
function box({ binary = true, cloud = false } = {}) {
  const files = fakeDisk({
    "/tree/.se/.runtime/hooks.json": JSON.stringify({ port: 7001, token: "t0k" }),
    ...(binary ? { [BIN]: "a binary" } : {}),
  });
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : `/tree/${rel}`);
  const runs = [];
  const logged = [];
  const $ = {
    ui: { log: (text) => logged.push(text) },
    fs: {
      read: async (rel) => files.read(at(rel)),
      exists: async (rel) => files.exists(at(rel)),
    },
    env: { get: async (key) => (cloud && key === "CLAUDE_CODE_REMOTE" ? "1" : undefined) },
    session: { usage: async () => ({}), messages: async () => [] },
    process: {
      run: async (argv, init) => {
        runs.push({ argv, init });
        if (argv[0] === "sh") {
          files.write(BIN, "a binary");
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        const effects = [{ kind: "result", text: REFUSED }];
        return { exitCode: 0, stdout: JSON.stringify({ effects }), stderr: `${FELL} It says: Unable to connect.` };
      },
    },
    http: {
      fetch: async () => {
        throw new Error("Unable to connect");
      },
    },
  };
  const hooks = {};
  register((event, fn) => {
    hooks[event] = fn;
  }, { method: METHOD });
  const handed = Object.assign(async (e) => ({ handed: e }), { event: "tool.call" });
  return { $, hooks, handed, runs, logged };
}

test("a door down runs the down word and hands its answer on", async () => {
  const it = box();
  const call = { tool: "Write", file_path: "spec/a.md", content: "x" };

  const said = await it.hooks["*"](it.$, call, it.handed);

  assert.deepEqual(said, { deny: REFUSED }, "the down word's refusal answers the call");
  assert.equal(it.runs.length, 1, "the down word runs once");
  assert.deepEqual(it.runs[0].argv, [BIN, "verb", `${METHOD}/src/scripts`, "hook", "down", "tool.call"]);
  assert.deepEqual(JSON.parse(it.runs[0].init.stdin), call, "with the event's fields on its input");
  assert.match(String(it.logged[0] ?? ""), /^LEVEL ZERO ANSWERS NOTHING\./, "and its fall line reaches the person");
});

test("a cloud box with no binary installs, then runs the down word", async () => {
  const it = box({ binary: false, cloud: true });

  const said = await it.hooks["*"](it.$, { tool: "Write", file_path: "spec/a.md" }, it.handed);

  assert.deepEqual(
    it.runs.map((one) => one.argv[0]),
    ["sh", BIN],
    "the install runs, then the down word",
  );
  assert.deepEqual(it.runs[0].argv, ["sh", `${METHOD}/install.sh`]);
  assert.deepEqual(said, { deny: REFUSED });
});
