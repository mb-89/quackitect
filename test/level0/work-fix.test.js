// What a group leaves open: each open child, and each open ticket the branch
// adds with no group, past the person route, which alone leaves loose.
// [[spec/design_output/work#a-box-leaves]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addedHere,
  joinsGroup,
  leftOpen,
  onPersonRoute,
} from "../../src/scripts/work-fix.js";
import { CHILD, doorsSaying, GROUP_NOTE, on } from "./work-doors.js";

const ADDED = "git diff --name-only --diff-filter=A origin/main...HEAD -- spec/tickets";
const loose = CHILD("", "open").replace("group: \n", "");
const person = loose.replace(
  "steps:\n",
  "process: [[spec/processes/person]]\nsteps:\n",
);

// [[spec/design_output/work#a-box-leaves]]
test("leftOpen names each open child and each open loose ticket the branch adds, and passes the person route, a closed one and another group's", () => {
  const { it } = doorsSaying(
    {
      [ADDED]: {
        stdout:
          "spec/tickets/left.md\nspec/tickets/shut.md\nspec/tickets/kept.md\nspec/tickets/trial.md\n",
      },
    },
    {
      [on("left")]: loose,
      [on("shut")]: CHILD("", "closed").replace("group: \n", ""),
      [on("kept")]: CHILD("another-group", "open"),
      [on("trial")]: person,
      [on("a-child")]: CHILD("one-group", "open"),
      [on("a-draft")]: CHILD("one-group", "draft"),
      [on("one-group")]: GROUP_NOTE,
    },
  );
  it.root = "/tree";
  assert.deepEqual(leftOpen(it, "one-group"), ["a-child", "a-draft", "left"]);
});

// A draft the branch adds with no group waits on a person, and lands loose on main. [[spec/tickets/done-skips-added-drafts]]
test("leftOpen leaves out a draft the branch adds with no group", () => {
  const { it } = doorsSaying(
    { [ADDED]: { stdout: "spec/tickets/sketch.md\nspec/tickets/left.md\n" } },
    {
      [on("sketch")]: CHILD("", "draft").replace("group: \n", ""),
      [on("left")]: loose,
      [on("one-group")]: GROUP_NOTE,
    },
  );
  it.root = "/tree";
  assert.deepEqual(leftOpen(it, "one-group"), ["left"]);
});

// [[spec/design_output/work#a-box-leaves]]
test("onPersonRoute reads the process in either spelling, and nothing else", () => {
  assert.equal(onPersonRoute(person), true);
  assert.equal(
    onPersonRoute(loose.replace("steps:\n", "process: person\nsteps:\n")),
    true,
  );
  assert.equal(
    onPersonRoute(
      loose.replace("steps:\n", "process: [[spec/processes/question]]\nsteps:\n"),
    ),
    false,
  );
  assert.equal(onPersonRoute(loose), false);
});

// A box's own ticket joins the group it works. [[spec/tickets/a-box-keeps-its-tickets]]
test("joinsGroup names the work branch's group on a ticket the mint writes there", () => {
  const fields = { state: "draft", process: "[[spec/processes/trivial]]" };
  assert.deepEqual(joinsGroup(fields, "work/one-group", "a-fix"), {
    ...fields,
    group: "one-group",
  });
});

// [[spec/tickets/a-box-keeps-its-tickets]]
test("joinsGroup leaves a named group, the person route, the group itself and trunk as they stand", () => {
  const named = { process: "trivial", group: "elsewhere" };
  assert.deepEqual(joinsGroup(named, "work/one-group", "a-fix"), named);
  const trial = { process: "[[spec/processes/person]]" };
  assert.deepEqual(joinsGroup(trial, "work/one-group", "a-trial"), trial);
  const self = { process: "group" };
  assert.deepEqual(joinsGroup(self, "work/one-group", "one-group"), self);
  const onTrunk = { process: "trivial" };
  assert.deepEqual(joinsGroup(onTrunk, "main", "a-fix"), onTrunk);
});

// The filing and the refusal read one list of what the branch adds. [[spec/tickets/groups-hold-groups]]
test("addedHere reads each ticket the branch adds off the disk, and passes one the disk lacks", () => {
  const { it } = doorsSaying(
    { [ADDED]: { stdout: "spec/tickets/left.md\nspec/tickets/gone.md\n" } },
    { [on("left")]: loose },
  );
  it.root = "/tree";
  assert.deepEqual(addedHere(it), [{ name: "left", text: loose }]);
});
