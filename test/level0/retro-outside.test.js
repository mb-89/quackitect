// A folder belongs to the tree it names, the way the retro's collect reads
// the harness's own folders under home and under temp.
// [[spec/guidance/retro/collect]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { belongs, slugOf } from "../../src/scripts/retro-outside.js";

// [[spec/guidance/retro/collect]]
test("a folder belongs to the tree by its name, whatever the case of the drive letter", () => {
  assert.equal(slugOf("c:\\work\\tree\\quackitect-v5"), "c--work-tree-quackitect-v5");
  assert.equal(
    belongs("C--work-tree-quackitect-v5", "c--work-tree-quackitect-v5"),
    true,
  );
  assert.equal(
    belongs("C--Temp-c--work-tree-quackitect-v5-stub", "c--work-tree-quackitect-v5"),
    true,
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v50", "c--work-tree-quackitect-v5"),
    false,
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v4", "c--work-tree-quackitect-v5"),
    false,
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v5-old", "c--work-tree-quackitect-v5", ["src"]),
    false,
    "a sibling tree names a folder the tree holds nowhere",
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v5-src-bridge", "c--work-tree-quackitect-v5", [
      "src",
    ]),
    true,
    "a session run from a folder inside the tree belongs",
  );
  assert.equal(
    belongs(
      "c--work-tree-quackitect-v5--claude-worktrees-a",
      "c--work-tree-quackitect-v5",
    ),
    true,
    "a worktree under a dot folder belongs",
  );
  assert.equal(
    belongs("c--other-c--work-tree-quackitect-v5x", "c--work-tree-quackitect-v5"),
    false,
  );
});
