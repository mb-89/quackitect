// The trust flag a cloud box needs before its session starts. The decision is
// pure and the write goes through the disk door, so a case here needs no home
// folder and touches nothing outside memory.
// [[spec/design_output/level0#the-setup-writes-the-flag]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { accept, CONFIG, configPath, FLAG, trusted } from "../../src/scripts/trust.js";

test("a config carrying nothing comes back trusting the folder", () => {
  const said = trusted({}, "/home/user/quackitect");

  assert.equal(said[FLAG], true);
  assert.equal(said.projects["/home/user/quackitect"][FLAG], true);
});

test("a config carrying nothing at all reads as empty", () => {
  const said = trusted(undefined, "/here");

  assert.equal(said[FLAG], true);
  assert.equal(said.projects["/here"][FLAG], true);
});

test("every other key and every other project stands alone", () => {
  const was = {
    userID: "abc",
    projects: { "/other": { [FLAG]: false, mcpServers: {} } },
  };
  const said = trusted(was, "/here");

  assert.equal(said.userID, "abc");
  assert.deepEqual(said.projects["/other"], { [FLAG]: false, mcpServers: {} });
  assert.equal(said.projects["/here"][FLAG], true);
});

test("a project the config already names keeps its other fields", () => {
  const said = trusted({ projects: { "/here": { [FLAG]: false, n: 2 } } }, "/here");

  assert.deepEqual(said.projects["/here"], { [FLAG]: true, n: 2 });
});

test("the config sits beside the home folder", () => {
  assert.equal(configPath("/home/user"), join("/home/user", CONFIG));
});

test("a box carrying no config gets one that trusts the folder", () => {
  const files = fakeDisk();
  const where = accept(files, "/home/user", "/home/user/quackitect");

  assert.equal(where, join("/home/user", CONFIG));
  const said = JSON.parse(files.read(where));
  assert.equal(said.projects["/home/user/quackitect"][FLAG], true);
});

test("a box carrying a config keeps what the client wrote there", () => {
  const files = fakeDisk({
    "/home/user/.claude.json": JSON.stringify({ userID: "abc", projects: {} }),
  });
  accept(files, "/home/user", "/tree");

  const said = JSON.parse(files.read("/home/user/.claude.json"));
  assert.equal(said.userID, "abc");
  assert.equal(said.projects["/tree"][FLAG], true);
});
