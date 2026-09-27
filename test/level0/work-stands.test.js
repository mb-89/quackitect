// What stands in the tree before a branch moves: each changed file, and
// whether a tag parks it.
// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { planOf } from "../../src/scripts/dispatch.js";
import { standingIn } from "../../src/scripts/work-stands.js";
import { CHILD, doorsSaying, GROUP_NOTE, remoteSaying } from "./work-doors.js";

const ROOT = "/tree";
const TAGGED = "---\nkind: [[ticket]]\ntodo: true\n---\n\n# Ask\n\nLater.\n";

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("a tagged note inside an untracked folder reads as parked, because the status names each file", () => {
  const git = fakeGit(
    {
      "git status --porcelain -uall": {
        stdout: "?? spec/drafts/fresh/later.md\n M src/x.js\n",
      },
    },
    ROOT,
  );
  const disk = fakeDisk({
    [join(ROOT, "spec", "drafts", "fresh", "later.md")]: TAGGED,
    [join(ROOT, "src", "x.js")]: "export const x = 1;\n",
  });

  const said = standingIn({ git, disk, join, root: ROOT });

  assert.deepEqual(said, [
    { name: "spec/drafts/fresh/later.md", parked: true },
    { name: "src/x.js", parked: false },
  ]);
  assert.deepEqual(
    git.ran.map((one) => one.argv.join(" ")),
    ["git status --porcelain -uall"],
  );
});

// A dependency reads off its group ticket on origin/main alone, so a parent standing on no branch still holds. [[spec/tickets/groups-hold-groups]]
test("a parent with no branch holds its dependents", () => {
  const after = GROUP_NOTE.replace("state: open\n", "state: open\ndepends_on: move\n");
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/after", tip: "tip-after", when: 1 }], {
      "work/after:spec/tickets/after.md": after,
      "origin/main:spec/tickets/after.md": after,
      "origin/main:spec/tickets/move.md": GROUP_NOTE,
      "origin/main:spec/tickets/a-part.md": CHILD("move", "open"),
    }),
  );
  it.clock = fakeClock("2026-01-02T00:00:00.000Z");
  it.stale = "12h";

  const plan = planOf(it);

  assert.deepEqual(plan.ready, []);
  assert.deepEqual(plan.waiting, [{ group: "after", waits: ["move"] }]);
});
