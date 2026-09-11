// A produced vehicle stands on its own: its own identity, its own verbs, and
// no path reaching back to the tree it came out of.
// [[spec/design_output/vehicle#a-vehicle-stands-alone]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { copyHere, produce } from "../../src/scripts/vehicle.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();

// [[spec/design_output/vehicle#a-vehicle-stands-alone]]
const GIT_BASH = [
  `${process.env.ProgramFiles}\\Git\\bin\\bash.exe`,
  `${process.env["ProgramFiles(x86)"]}\\Git\\bin\\bash.exe`,
  `${process.env.LocalAppData}\\Programs\\Git\\bin\\bash.exe`,
];
const SHELL =
  process.platform === "win32" ? (GIT_BASH.find((one) => files.exists(one)) ?? "bash") : "sh";
const quoted = (said) => String(said).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const either = (path) => `(?:${quoted(path)}|${quoted(path.split("\\").join("/"))})`;

test("a copy carries the method, its run bits, and no private material", () => {
  const where = files.tempDir("vehicle-");
  const dest = join(where, "copy");
  try {
    const put = produce(files, root, dest);
    assert.equal(put.ok, true);
    assert.ok(put.count > 100, `a whole method comes over, and this says ${put.count}`);

    for (const path of ["RUNME.sh", "package.json", ".vale.ini"]) {
      assert.ok(files.exists(join(dest, path)), `${path} travels`);
    }
    assert.ok(
      files.exists(join(dest, ".claude/skills/level0/.claude-plugin/plugin.json")),
      "the copy carries the marker, so it reads as a method root",
    );
    for (const path of [".git", ".se", "node_modules"]) {
      assert.equal(files.exists(join(dest, path)), false, `${path} stays behind`);
    }

    const ran = outside.run([SHELL, "-c", "test -x RUNME.sh"], { cwd: dest });
    assert.equal(ran.exitCode, 0, "RUNME.sh comes over runnable");
  } finally {
    files.remove(where);
  }
});

test("a copy makes an identity of its own", () => {
  const where = files.tempDir("vehicle-");
  const dest = join(where, "copy");
  try {
    produce(files, root, dest);
    const mine = copyHere(files, clock(), root);
    const other = copyHere(files, clock(), dest);

    assert.ok(other, "the copy answers an identity");
    assert.notEqual(other, mine, "a copy holds its own, and never the one it came from");
    assert.equal(copyHere(files, clock(), dest), other, "and keeps it");
  } finally {
    files.remove(where);
  }
});

test("a copy answers its own verbs, with no tree behind it", () => {
  const where = files.tempDir("vehicle-");
  const dest = join(where, "copy");
  try {
    produce(files, root, dest);

    const said = outside.run([SHELL, "RUNME.sh", "vehicle"], { cwd: dest });
    assert.equal(said.exitCode, 0, said.stderr);
    assert.match(said.stdout, new RegExp(`method\\s+${either(dest)}`), "it names itself as method");
    assert.match(said.stdout, new RegExp(`work\\s+${either(dest)}`), "and as work");
    assert.match(said.stdout, /drives itself/);
    assert.equal(
      said.stdout.includes(root),
      false,
      "nothing in the answer reaches the tree it came from",
    );
  } finally {
    files.remove(where);
  }
});
