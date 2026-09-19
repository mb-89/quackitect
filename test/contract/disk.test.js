// The disk door, against the real filesystem. Every other test takes the fake,
// and this one holds the fake to what the disk does.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { proc } from "../../src/doors/proc.js";

function through(door) {
  const at = door.tempDir("level0-disk-");
  const file = join(at, "notes.md");
  const under = join(at, "deep");

  door.write(file, "# Notes\n");
  door.append(file, "more\n");
  door.append(join(at, "fresh.md"), "one\n");
  door.makeDir(under);
  door.write(join(under, "more.md"), "more\n");
  // A copy carries bytes, and the size it answers is what a manifest names. [[spec/design_output/doors#a-fake-behaves]]
  door.copy(file, join(at, "copy.md"));
  // A move carries a folder whole and leaves nothing where it stood. [[spec/guidance/retro/collect]]
  door.makeDir(join(at, "box"));
  door.write(join(at, "box", "one.md"), "one\n");
  door.move(join(at, "box"), join(under, "box"));

  const said = {
    read: door.read(file),
    fresh: door.read(join(at, "fresh.md")),
    exists: door.exists(file),
    folder: door.exists(under),
    missing: door.exists(join(at, "nothing.md")),
    copied: door.read(join(at, "copy.md")),
    size: door.size(file),
    moved: door.read(join(under, "box", "one.md")),
    left: door.exists(join(at, "box")),
    newer: door.modified(join(at, "fresh.md")) >= door.modified(file),
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
  assert.equal(said.read, "# Notes\nmore\n");
  assert.equal(said.fresh, "one\n");
  assert.equal(said.exists, true);
  assert.equal(said.folder, true);
  assert.equal(said.missing, false);
  assert.equal(said.copied, "# Notes\nmore\n", "a copy reads what the file reads");
  assert.equal(said.size, said.read.length);
  assert.equal(said.moved, "one\n", "a moved folder reads what it held");
  assert.equal(said.left, false, "a move leaves nothing where it stood");
  assert.equal(said.newer, true, "a later write reads as no older");
  assert.deepEqual(said.list, [
    "copy.md:file",
    "deep:dir",
    "fresh.md:file",
    "notes.md:file",
  ]);
  assert.equal(said.gone, false);
});

test("the fake answers what the real door answers", () => {
  assert.deepEqual(through(fakeDisk()), through(disk()));
});

function linking(door) {
  const at = door.tempDir("level0-link-");
  const target = join(at, "source");
  const link = join(at, "linked");
  door.makeDir(target);
  door.write(join(target, "one.md"), "one\n");

  const before = door.isLink(link);
  door.link(target, link);
  const said = {
    before,
    after: door.isLink(link),
    exists: door.exists(link),
    real: door.realOf(link) === door.realOf(target),
    plain: door.isLink(target),
  };
  let again = "";
  try {
    door.link(target, link);
  } catch (err) {
    again = err.code;
  }
  said.again = again;
  door.remove(link);
  said.gone = door.exists(link);
  said.kept = door.exists(join(target, "one.md"));

  // [[spec/design_output/extension#a-link-pointing-nowhere]]
  const dangling = join(at, "dangling");
  door.link(join(at, "nowhere"), dangling);
  said.dangling = door.isLink(dangling);
  said.reaches = door.exists(dangling);
  door.remove(dangling);
  said.danglingGone = door.isLink(dangling);
  door.remove(at);
  return said;
}

// [[spec/design_output/extension#the-link-stands]]
test("a link reads as a link to its target, and removing it keeps the target", () => {
  assert.deepEqual(linking(disk()), {
    before: false,
    after: true,
    exists: true,
    real: true,
    plain: false,
    again: "EEXIST",
    gone: false,
    kept: true,
    dangling: true,
    reaches: false,
    danglingGone: false,
  });
});

test("the fake links the way the real door links", () => {
  assert.deepEqual(linking(fakeDisk()), linking(disk()));
});

test("both doors refuse a file nobody wrote", () => {
  for (const door of [disk(), fakeDisk()]) {
    assert.throws(() => door.read("/nothing/at/all.md"), /no such file|ENOENT/);
  }
});

// [[spec/design_output/vehicle#a-vehicle-stands-alone]]
test("a file made runnable runs", {
  skip: process.platform === "win32" && "Windows keeps no run bit",
}, () => {
  const files = disk();
  const where = files.tempDir("disk-");
  try {
    const at = join(where, "one.sh");
    files.write(at, "#!/usr/bin/env sh\necho here\n");
    files.runnable(at);

    const said = proc().run([at], { cwd: where });
    assert.equal(said.exitCode, 0, said.stderr);
    assert.match(said.stdout, /here/);
  } finally {
    files.remove(where);
  }
});
