// The git door, against a real repository this test builds and throws away.
// Everything above it takes the fake process, so git costs the suite once.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";
import { asText, framed, namesIn } from "../../src/scripts/work-read.js";

const WHO = "Duck Tester";

function repoHere(files) {
  const at = files.tempDir("level0-git-");
  const door = git(proc(), at);
  door.run(["init", "-b", "main"], true);
  door.run(["config", "user.email", "duck@example.com"], true);
  door.run(["config", "user.name", WHO], true);
  files.write(join(at, "notes.md"), "# Notes\n");
  door.add("notes.md");
  door.run(["-c", "commit.gpgsign=false", "commit", "-m", "the first commit"], true);
  return { at, door };
}

const answers = (door) => ({
  branch: door.branch(),
  dirty: door.dirty(),
  ahead: door.countBetween("HEAD", "HEAD"),
  who: door.lastAuthor("HEAD"),
  missing: door.show("HEAD:nothing.md"),
});

const taught = {
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  "git status --porcelain": { stdout: "" },
  "git rev-list --count HEAD..HEAD": { stdout: "0\n" },
  "git log -1 --format=%an HEAD": { stdout: `${WHO}\n` },
  "git show HEAD:nothing.md": { exitCode: 128, stderr: "no such path\n" },
};

test("the real door reads the branch, the tree and the last author", () => {
  const files = disk();
  const { at, door } = repoHere(files);
  try {
    const said = answers(door);
    assert.equal(said.branch, "main");
    assert.equal(said.dirty, false);
    assert.equal(said.who, WHO);
    assert.equal(said.missing, "");

    files.write(join(at, "notes.md"), "# Notes\n\nMore.\n");
    assert.equal(door.dirty(), true);
  } finally {
    files.remove(at);
  }
});

test("the fake answers what the real door answers", () => {
  const files = disk();
  const { at, door } = repoHere(files);
  try {
    assert.deepEqual(answers(fakeGit(taught, at)), answers(door));
  } finally {
    files.remove(at);
  }
});

// [[spec/design_output/work#the-listing-reads-git-once]]
test("the batch answers every object asked for, and says missing where none stands", () => {
  const files = disk();
  const { at, door } = repoHere(files);
  try {
    const said = framed(door.batch(["HEAD:notes.md", "HEAD:nothing.md"]), [
      "HEAD:notes.md",
      "HEAD:nothing.md",
    ]);
    assert.equal(asText(said.get("HEAD:notes.md")), "# Notes\n");
    assert.equal(said.get("HEAD:nothing.md"), "");
    assert.equal(door.batch([]), "");
  } finally {
    files.remove(at);
  }
});

// A tree stands under the ask, and its names come off the bytes. [[spec/design_output/work#the-listing-reads-git-once]]
test("the batch answers a tree, and the names read off it", () => {
  const files = disk();
  const { at, door } = repoHere(files);
  try {
    const ask = "HEAD:";
    const said = framed(door.batch([ask]), [ask]);
    assert.deepEqual(namesIn(said.get(ask)), ["notes.md"]);
  } finally {
    files.remove(at);
  }
});

test("a command reaching git names git first, so the fake sees the whole line", () => {
  const outside = fakeProc(taught);
  git(outside, "/anywhere").branch();
  assert.deepEqual(outside.ran[0].argv, ["git", "rev-parse", "--abbrev-ref", "HEAD"]);
  assert.equal(outside.ran[0].init.cwd, "/anywhere");
});
