// Copilot's cage shadow: in shadow the hook runs the quack hook verb with the
// runtime's answer as old, and under old it runs nothing.
// [[spec/tickets/copilot-meets-the-hooks-door]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { shadowsHook } from "../../src/scripts/copilot-shadow.js";

const ROOT = "/tree";
const TRACKED = join(ROOT, "spec", "config", "level0.json");
const BIN = join(ROOT, ".se", ".runtime", "bin", "se-index");

function itOf(mode, answer = { exitCode: 0, stdout: '{"effects":[]}' }) {
  return {
    root: ROOT,
    work: ROOT,
    platform: "linux",
    env: {},
    disk: fakeDisk({ [TRACKED]: JSON.stringify({ migration: { cage: mode } }) }),
    proc: fakeProc({ [`${BIN} hook PreToolUse`]: answer }),
  };
}

test("copilot in shadow runs the hook verb with its own answer as old", () => {
  const it = itOf("shadow");
  const input = { session_id: "s1", tool_name: "Bash" };
  shadowsHook(it, "PreToolUse", input, { deny: "no" });
  assert.equal(it.proc.ran.length, 1);
  assert.deepEqual(it.proc.ran[0].argv, [BIN, "hook", "PreToolUse"]);
  assert.deepEqual(JSON.parse(it.proc.ran[0].init.stdin), {
    ...input,
    old: { result: { deny: "no" } },
  });
});

test("under old copilot runs no hook verb", () => {
  const it = itOf("old");
  shadowsHook(it, "PreToolUse", { session_id: "s1" }, {});
  assert.equal(it.proc.ran.length, 0);
});

test("a hook verb that throws leaves copilot's answer standing", () => {
  const it = itOf("shadow", () => {
    throw new Error("the deadline expires");
  });
  assert.doesNotThrow(() => shadowsHook(it, "PreToolUse", { session_id: "s1" }, {}));
  assert.equal(it.proc.ran.length, 1);
});
