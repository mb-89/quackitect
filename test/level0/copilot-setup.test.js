// Generated registrations preserve user files and tolerate repeated setup.
// [[spec/design_output/copilot#setup-and-discovery]]

import assert from "node:assert/strict";
import { posix } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { registrations, setup } from "../../.claude/skills/level0/lib/copilot-setup.js";

const fixture = () => ({
  root: "/tree",
  disk: fakeDisk(),
  join: posix.join,
  dirname: posix.dirname,
  detect: () => true,
});

test("setup is idempotent and Claude settings stay untouched", () => {
  const it = fixture();
  it.disk.write("/tree/.claude/settings.json", "original");
  assert.equal(setup(it).length, 2);
  assert.deepEqual(setup(it), []);
  assert.equal(it.disk.read("/tree/.claude/settings.json"), "original");
  const hooks = JSON.parse(registrations()[".github/hooks/level0.json"]);
  assert.deepEqual(Object.keys(hooks.hooks), [
    "sessionStart",
    "preToolUse",
    "postToolUse",
    "agentStop",
  ]);
  assert.match(hooks.hooks.preToolUse[0].command, /hook PreToolUse$/);
  assert.equal(hooks.version, 1);
});

test("setup preserves an existing user workflow", () => {
  const it = fixture();
  it.disk.write("/tree/.github/workflows/copilot-setup-steps.yml", "user workflow");
  assert.throws(() => setup(it), /belongs to you/);
  assert.equal(
    it.disk.read("/tree/.github/workflows/copilot-setup-steps.yml"),
    "user workflow",
  );
  assert.equal(it.disk.exists("/tree/.github/hooks/level0.json"), false);
});

test("explicit cloud setup does not depend on local detection", () => {
  const it = fixture();
  it.detect = () => false;
  assert.deepEqual(setup(it), []);
  assert.equal(setup(it, "cloud").length, 2);
  assert.equal(it.disk.read("/tree/.se/copilot-cloud"), "cloud\n");
});
