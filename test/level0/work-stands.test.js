// What stands in the tree before a branch moves: each changed file, and
// whether a tag parks it.
// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import {
  refsHere,
  standingIn,
  TODO,
  waitingOn,
} from "../../src/scripts/work-stands.js";
import { GROUP_NOTE, remoteSaying } from "./work-doors.js";

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

// A branch answers first, and trunk answers for a dependency on no branch. [[spec/tickets/groups-hold-groups]]
test("waitingOn holds on a standing branch or an open ticket on trunk, and on no name trunk lacks", () => {
  const text = GROUP_NOTE.replace(
    "state: open\n",
    "state: open\ndepends_on: [busy, parent, shut, gone]\n",
  );
  const standing = new Map([["work/busy", TODO]]);
  const trunk = new Map([
    ["parent", GROUP_NOTE],
    ["shut", GROUP_NOTE.replace("state: open", "state: closed")],
  ]);
  assert.deepEqual(waitingOn(text, standing, trunk), ["busy", "parent"]);
  assert.deepEqual(waitingOn(text, standing), ["busy"], "no trunk read, no parent");
});

// [[spec/tickets/the-queue-views-agree]]
test("a ref whose base stands short of the trunk tip reads behind, and one with no trunk tip reads level", () => {
  const refs = (more) =>
    refsHere({
      git: fakeGit(
        {
          ...remoteSaying([{ branch: "work/one-group", tip: "aaa", base: "older" }]),
          ...more,
        },
        ROOT,
      ),
    });

  const [behind] = refs({});
  assert.equal(behind.behind, true);
  assert.equal(behind.orphan, false);
  const [level] = refs({ "git rev-parse origin/main": { exitCode: 1 } });
  assert.equal(level.behind, false);
});
