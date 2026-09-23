// The cloud starts its own server: the node script the bridgehead runs, what it
// answers where a piece is missing, and the line each code writes.
// [[spec/design_output/level0#the-bridgehead-starts-it-too]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { reasonOf, START } from "../../.claude/skills/level0/hooks/level0.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const files = disk();

const MARKER = "started.txt";
const LOCAL = { CLAUDE_CODE_REMOTE: "", SE_CLOUD: "" };
const CLOUD = { CLAUDE_CODE_REMOTE: "true", SE_CLOUD: "" };
// The stub answers the self-test the road runs first, and starts on the plain call. [[spec/design_output/level0#new-code-proves-it-loads]]
const SERVER =
  "if (process.argv.includes('--selftest')) process.exit(0);\nrequire('fs').writeFileSync(process.argv[2] + '/started.txt', 'up')\n";
const BROKEN =
  "if (process.argv.includes('--selftest')) { console.error('ReferenceError: dropsMoved is not defined'); process.exit(1); }\nrequire('fs').writeFileSync(process.argv[2] + '/started.txt', 'up')\n";
// An install standing in for the real one: it brings the folder the road looks for, in the method root the road runs it from. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const INSTALL = "mkdir -p node_modules\n";
const SKIP = "index se-lsp";
const WAITS = 40;

const nodeHere = () =>
  proc().run(["node", "-e", "process.exit(0)"], { timeoutMs: 5000 }).exitCode === 0;

function runs(where, env) {
  return proc().run(["node", "-e", START, where, where, SKIP], {
    env,
    timeoutMs: 30_000,
  });
}

function tree(modules, install = false) {
  const where = files.tempDir("level0-start-");
  files.makeDir(join(where, "src", "bridge"));
  files.write(join(where, "src", "bridge", "server.js"), SERVER);
  if (install) {
    files.makeDir(join(where, "src", "scripts"));
    files.write(join(where, "src", "scripts", "install.sh"), INSTALL);
  }
  if (modules) files.makeDir(join(where, "node_modules"));
  return where;
}

function waitsFor(at) {
  const held = new Int32Array(new SharedArrayBuffer(4));
  for (let step = 0; step < WAITS; step++) {
    if (files.exists(at)) return true;
    Atomics.wait(held, 0, 0, 100);
  }
  return files.exists(at);
}

// The marker lands while the detached node still holds the folder as its cwd, and Windows answers EPERM to a remove under a live process, so the retry gives the child the moment it takes to exit. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
function gone(where) {
  const held = new Int32Array(new SharedArrayBuffer(4));
  for (let step = 0; step < WAITS; step++) {
    try {
      files.remove(where);
      return;
    } catch {
      Atomics.wait(held, 0, 0, 100);
    }
  }
}

test("a box outside the cloud starts nothing, because a person stands beside it", () => {
  const where = tree(true);
  try {
    const said = runs(where, LOCAL);
    assert.equal(said.exitCode, 3);
    assert.equal(files.exists(join(where, MARKER)), false, "no server stands");
    assert.equal(reasonOf(said.exitCode)[0], "", "and no line lands in the log");
  } finally {
    files.remove(where);
  }
});

test("a cloud box whose install brings no modules says so and starts nothing", () => {
  const where = tree(false);
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 6);
    const [level, why] = reasonOf(said.exitCode);
    assert.equal(level, "warn");
    assert.match(why, /modules/);
    assert.equal(files.exists(join(where, MARKER)), false, "no server stands");
  } finally {
    files.remove(where);
  }
});

test("a fresh clone carrying no modules installs them, then starts the server", {
  skip: nodeHere() ? false : "this box carries no node on the PATH",
}, () => {
  const where = tree(false, true);
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 7);
    assert.equal(reasonOf(said.exitCode)[0], "info");
    assert.equal(
      files.exists(join(where, "node_modules")),
      true,
      "the install brought the modules the server imports",
    );
    assert.equal(waitsFor(join(where, MARKER)), true, "and the server ran after it");
  } finally {
    gone(where);
  }
});

test("a root that stands nowhere says so", () => {
  const said = runs(join(files.tempDir("level0-start-"), "absent"), CLOUD);
  assert.equal(said.exitCode, 4);
  assert.equal(reasonOf(said.exitCode)[0], "warn");
});

test("a cloud box starts the server, and the call comes back before it stands", {
  skip: nodeHere() ? false : "this box carries no node on the PATH",
}, () => {
  const where = tree(true);
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 0);
    assert.equal(reasonOf(said.exitCode)[0], "info");
    assert.equal(waitsFor(join(where, MARKER)), true, "the server ran on its own");
    assert.equal(
      files.exists(join(where, ".se", ".log")),
      true,
      "the log folder stands for the server to write into",
    );
  } finally {
    gone(where);
  }
});

// A tree whose bridge fails its self-test starts no server, and the road says why once. [[spec/design_output/level0#new-code-proves-it-loads]]
test("a cloud box whose bridge fails its self-test starts nothing, and names the fault", {
  skip: nodeHere() ? false : "this box carries no node on the PATH",
}, () => {
  const where = tree(true);
  files.write(join(where, "src", "bridge", "server.js"), BROKEN);
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 8);
    assert.equal(reasonOf(said.exitCode)[0], "warn");
    assert.match(said.stderr, /dropsMoved is not defined/);
    assert.equal(files.exists(join(where, MARKER)), false, "no server stands");
  } finally {
    gone(where);
  }
});

test("a code nobody names reads as a warning", () => {
  const [level, why] = reasonOf(9);
  assert.equal(level, "warn");
  assert.match(why, /9/);
});
