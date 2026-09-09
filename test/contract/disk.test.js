// The disk door, against the real filesystem. Every other test takes the fake,
// and this one holds the fake to what the disk does.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

function through(door) {
  const at = door.tempDir("level0-disk-");
  const file = join(at, "notes.md");
  const under = join(at, "deep");

  door.write(file, "# Notes\n");
  door.makeDir(under);
  door.write(join(under, "more.md"), "more\n");

  const said = {
    read: door.read(file),
    exists: door.exists(file),
    folder: door.exists(under),
    missing: door.exists(join(at, "nothing.md")),
    list: door
      .list(at)
      .map((one) => `${one.name}:${one.kind}`)
      .sort(),
  };

  door.remove(at);
  said.gone = door.exists(file);
  return said;
}

test("the real door writes, reads back, lists and removes", () => {
  const said = through(disk());
  assert.equal(said.read, "# Notes\n");
  assert.equal(said.exists, true);
  assert.equal(said.folder, true);
  assert.equal(said.missing, false);
  assert.deepEqual(said.list, ["deep:dir", "notes.md:file"]);
  assert.equal(said.gone, false);
});

test("the fake answers what the real door answers", () => {
  assert.deepEqual(through(fakeDisk()), through(disk()));
});

test("both doors refuse a file nobody wrote", () => {
  for (const door of [disk(), fakeDisk()]) {
    assert.throws(() => door.read("/nothing/at/all.md"), /no such file|ENOENT/);
  }
});
