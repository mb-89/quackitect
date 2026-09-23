// What stands in the tree before a branch moves: each changed file, and
// whether a tag parks it.
// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { standingIn } from "../../src/scripts/work-stands.js";

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
