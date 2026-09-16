// A stub produced for real: every file reads back, the shim reaches the
// vehicle it names, and no file of the method travels.
// [[spec/design_output/vehicle#nothing-of-the-method-travels]]

import assert from "node:assert/strict";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";
import { stubInto } from "../../src/scripts/stub.js";
import { copyHere } from "../../src/scripts/vehicle.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const MARKER = ".claude/skills/level0/.claude-plugin/plugin.json";
const METHOD = [MARKER, "package.json", "src/scripts/cli.js", "spec/guidance/voice.md", ".se"];
const quoted = (said) => String(said).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const either = (path) => `(?:${quoted(path)}|${quoted(path.split("\\").join("/"))})`;

function walk(at, rel = "") {
  const out = [];
  for (const one of files.list(at)) {
    const next = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...walk(join(at, one.name), next));
    else out.push(next);
  }
  return out.sort();
}

test("a stub holds its files, reads every one back, and no file of the method", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  try {
    const said = stubInto(files, git(outside, root), clock(), root, dest);
    assert.equal(said.ok, true, said.why);
    assert.ok(files.exists(dest), "the stub stands");
    assert.deepEqual(walk(dest), [...said.files].sort(), "every file the list names, and nothing else");
    for (const one of said.files) assert.ok(files.read(join(dest, one)) !== undefined, one);
    for (const one of METHOD) assert.equal(files.exists(join(dest, one)), false, `${one} stays behind`);

    const record = JSON.parse(files.read(join(dest, "vehicle.json")));
    assert.equal(record.vehicle, copyHere(files, clock(), root), "the identity is this vehicle's");
    assert.equal(record.name, basename(root), "the name is this folder's");
    const remote = outside.run(["git", "remote", "get-url", "origin"], { cwd: root });
    assert.equal(record.upstream, remote.stdout.trim(), "the upstream is this vehicle's remote");

    const ran = outside.run(["sh", "-c", "test -x RUNME.sh"], { cwd: dest });
    assert.equal(ran.exitCode, 0, "the shim carries its run bit");
  } finally {
    files.remove(where);
  }
});

test("the shim hands a verb to the vehicle it names", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  try {
    const said = stubInto(files, git(outside, root), clock(), root, dest);
    assert.equal(said.ok, true, said.why);
    const ran = outside.run(["sh", "RUNME.sh", "vehicle"], {
      cwd: dest,
      env: { SE_VEHICLE: root, SE_INSTALL_SKIP: "index se-lsp editor-client" },
    });
    assert.equal(ran.exitCode, 0, ran.stderr);
    assert.match(ran.stdout, new RegExp(`method\\s+${either(root)}`), "the vehicle answers");

    const lost = outside.run(["sh", "RUNME.sh", "vehicle"], {
      cwd: dest,
      env: { SE_VEHICLE: join(where, "nowhere"), HOME: where },
    });
    assert.equal(lost.exitCode, 1, "a shim finding no vehicle exits one");
    assert.match(lost.stderr, /vehicle/);
  } finally {
    files.remove(where);
  }
});

test("a vehicle with no remote refuses, and the folder stands as it was", () => {
  const where = files.tempDir("stub-");
  const repo = join(where, "repo");
  const dest = join(where, "stub");
  files.makeDir(repo);
  try {
    assert.equal(outside.run(["git", "init", "-q"], { cwd: repo }).exitCode, 0);
    const refused = stubInto(files, git(outside, repo), clock(), root, dest);
    assert.equal(refused.ok, false);
    assert.match(refused.why, /--upstream/);
    assert.equal(files.exists(dest), false, "a refusal writes nothing");

    const named = stubInto(files, git(outside, repo), clock(), root, dest, {
      upstream: "https://host/c/d.git",
    });
    assert.equal(named.ok, true, named.why);
    assert.equal(JSON.parse(files.read(join(dest, "vehicle.json"))).upstream, "https://host/c/d.git");
  } finally {
    files.remove(where);
  }
});

test("the command line writes a stub where it says, and refuses with no folder", () => {
  const where = files.tempDir("stub-");
  const dest = join(where, "stub");
  const env = { SE_INSTALL_SKIP: "index se-lsp editor-client" };
  try {
    const bare = outside.run([process.execPath, "src/scripts/cli.js", "stub"], { cwd: root, env });
    assert.equal(bare.exitCode, 2, "no folder, no stub");
    assert.match(bare.stderr, /stub into/);

    const said = outside.run([process.execPath, "src/scripts/cli.js", "stub", "into", dest], {
      cwd: root,
      env,
    });
    assert.equal(said.exitCode, 0, said.stderr);
    assert.match(said.stdout, /file\(s\) written/);
    assert.ok(files.exists(join(dest, "vehicle.json")), "the record stands where the verb says");

    const named = outside.run(
      [process.execPath, "src/scripts/cli.js", "stub", "into", `${dest}2`, "--upstream", "https://host/c/d.git"],
      { cwd: root, env },
    );
    assert.equal(named.exitCode, 0, named.stderr);
    assert.equal(JSON.parse(files.read(join(`${dest}2`, "vehicle.json"))).upstream, "https://host/c/d.git");
  } finally {
    files.remove(where);
  }
});
