// The pass commit over the pull doors: a design review passing with findings
// stages its children beside the ticket and the files its hand's journal names.
// [[spec/design_output/pull#the-refused-commit]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  heard,
  ROOT,
  standing,
} from "./pull-doors.js";

// The one field a child's route asks, so the child mints. [[spec/design_output/pull#a-finding-rides-out]]
const ROUTE = `for: a fix small enough that the ask is the design
ask:
  - name: gain
    form: text
    says: what is gained
steps:
  - name: do
    does: makes the change
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes
`;

// A journal stamped past any hold, naming the ticket its call serves. [[spec/design_output/pull#the-refused-commit]]
const journal = (ticket, file) =>
  `${JSON.stringify({ on: "", by: "level0", at: "9999-01-01T00:00:00.000Z", ticket, files: [{ file }] })}\n`;

// [[spec/design_output/pull#the-refused-commit]]
test("a pass with findings stages its children, the ticket and the hand's own paths, and leaves a sibling's edit unstaged", () => {
  const staged = [];
  const git = (argv) => {
    if (argv[1] === "add") staged.push(argv.slice(2).join(" "));
    return { exitCode: 0 };
  };
  const files = standing(
    CHILD("closed", "implement/change", "reason: done\n"),
    GROUP_NOTE,
    {
      [at("spec/processes/trivial.yaml")]: ROUTE,
      [at(".se/.runtime/undo/99990101000000000000.json")]: journal(
        "a-child",
        "src/mine.js",
      ),
      [at(".se/.runtime/undo/99990101000000000001.json")]: journal(
        "a-sibling",
        "src/theirs.js",
      ),
    },
  );
  files[at("spec/tickets/a-child.md")] = filled(
    CHILD("open", "design/review"),
    "### verdict",
    ["pass with findings", "- cut-the-long-line: the second line runs long"].join("\n"),
  );
  const { it } = doors(files, { git }, { words: 5 });
  heard(() => pulling(ROOT, ["pull"], it));
  staged.length = 0;

  const back = heard(() => pulling(ROOT, ["pull", "a-child"], it));

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(staged, [
    [
      "--",
      at("spec/tickets/a-child.md"),
      at("spec/tickets/cut-the-long-line.md"),
      at("src/mine.js"),
    ].join(" "),
  ]);
});
