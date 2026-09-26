// The pass skips a leaf under `when: view` where the Ask names no view, and
// stops at it where the Ask names one.
// [[spec/tickets/the-owner-view-decides-done]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf, recordIn } from "../../src/engine/group.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, filled, heard, ROOT, standing } from "./pull-doors.js";

const RED = {
  sh: { exitCode: 1, stdout: "assertion, 1 test(s) fail on their own assertion\n" },
};

function passedRed(view) {
  const route = CHILD("open", "implement/tests-red")
    .replace("when: returned", "when: view")
    .replace("One piece of it.", `One piece of it.\n\nview: ${view}`);
  const ready = filled(
    route,
    "### tests",
    "node --test test/x.test.js\n\n### checked\n\n- it touches the two files\n- the proc fake stands",
  );
  const { it, disk } = doors(standing(ready), RED);
  heard(() => pulling(ROOT, ["pull"], it));
  const said = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(said.code, 0, said.said);
  return disk.read(at("spec/tickets/a-child.md"));
}

test("the pass stops at the view leaf where the Ask names a view", () => {
  const now = passedRed("the sidebar button reads 3");
  assert.equal(fieldOf(now, "step"), "implement/reflect");
});

test("the pass skips the view leaf where the Ask says view: none", () => {
  const now = passedRed("none");
  assert.equal(fieldOf(now, "step"), "implement/change");
  assert.deepEqual(recordIn(now).at(-1), {
    step: "implement/reflect",
    skipped: true,
    why: "the ask names no view the owner reads",
  });
});
