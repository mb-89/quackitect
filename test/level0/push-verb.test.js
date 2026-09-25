// The push verb over fake doors: a green stamp on the commit pushes, and any
// other stamp pushes nothing.
// [[spec/design_output/work#one-verb-feeds-that-stamp]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { pushVerb } from "../../src/scripts/push-verb.js";

const ROOT = "/tree";
const HEAD = "a".repeat(40);

const quiet = (what) => {
  const was = [console.log, console.error];
  console.log = () => {};
  console.error = () => {};
  try {
    return what();
  } finally {
    [console.log, console.error] = was;
  }
};

const doors = (stamp) => {
  const git = fakeGit(
    {
      "git rev-parse HEAD": { stdout: `${HEAD}\n` },
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    },
    ROOT,
  );
  const disk = fakeDisk(stamp ? { [join(ROOT, STAMP)]: JSON.stringify(stamp) } : {});
  return { it: { root: ROOT, join, git, disk }, git };
};

const pushed = (git) =>
  git.ran.some((one) => one.argv.join(" ") === "git push origin main");

// [[spec/design_output/work#one-verb-feeds-that-stamp]]
test("a green stamp on the commit pushes the branch", () => {
  const { it, git } = doors({ sha: HEAD, ok: true, clean: true, warnings: 0 });
  assert.equal(
    quiet(() => pushVerb(it)),
    0,
  );
  assert.ok(pushed(git), "the branch reaches origin");
});

// [[spec/design_output/work#one-verb-feeds-that-stamp]]
test("no stamp, or a stamp on another commit, pushes nothing", () => {
  for (const stamp of [null, { sha: "b".repeat(40), ok: true, green: true }]) {
    const { it, git } = doors(stamp);
    assert.equal(
      quiet(() => pushVerb(it)),
      1,
    );
    assert.ok(!pushed(git), "nothing reaches origin");
  }
});
