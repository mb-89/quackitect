// The fakes key a path the same way on every platform, so a branch green on a
// cloud box stays green on a Windows desk.
// [[spec/design_output/doors#a-fake-behaves]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

test("the disk's maps find a Windows path under its posix key", () => {
  const disk = fakeDisk({ "\\tree\\a.md": "a" });
  disk.write("/tree/b.md", "b");

  assert.equal(disk.files.get("/tree/a.md"), "a");
  assert.equal(disk.files.has("\\tree\\b.md"), true);
  assert.equal(disk.times.has("\\tree\\b.md"), true);
  assert.equal(disk.files.delete("\\tree\\a.md"), true);
  assert.equal(disk.exists("/tree/a.md"), false);
});

test("the process table taught a posix path answers a Windows run", () => {
  const proc = fakeProc({ "node /tree/cli.js check": { exitCode: 3 } });
  proc.teach(["\\node"], { exitCode: 4 });

  assert.equal(proc.run(["node", "\\tree\\cli.js", "check"]).exitCode, 3);
  assert.equal(proc.run(["/node", "--version"]).exitCode, 4);
});
