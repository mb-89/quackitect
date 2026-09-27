// What a fix group leaves: the agent tickets its branch adds, read off the diff
// against trunk, and nothing where the group is a feature group.
// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fixLeaves } from "../../src/scripts/work-fix.js";
import { CHILD, doorsSaying, GROUP_NOTE, on } from "./work-doors.js";

const ADDED = "git diff --name-only --diff-filter=A origin/main...HEAD -- spec/tickets";
const loose = CHILD("", "open").replace("group: \n", "");

// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
test("fixLeaves names the open loose agent tickets a fix group adds, and passes a closed one and a grouped one", () => {
  const { it } = doorsSaying(
    {
      [ADDED]: {
        stdout: "spec/tickets/left.md\nspec/tickets/shut.md\nspec/tickets/kept.md\n",
      },
    },
    {
      [on("left")]: loose,
      [on("shut")]: CHILD("", "closed").replace("group: \n", ""),
      [on("kept")]: CHILD("one-group", "open"),
    },
  );
  it.root = "/tree";
  const fix = GROUP_NOTE.replace("state: open\n", "state: open\nfix: true\n");
  assert.deepEqual(fixLeaves(it, fix), ["left"]);
  assert.deepEqual(fixLeaves(it, GROUP_NOTE), [], "a feature group reads no diff");
});
