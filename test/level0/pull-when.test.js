// The conditions a leaf names, read off the box and the ticket's Ask.
// [[spec/design_output/pull#a-condition-skips-a-leaf]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { holdsHere, viewOf } from "../../src/scripts/pull-when.js";

const TICKET = (ask) =>
  `---\nkind: [[ticket]]\n---\n\n# Ask\n\n${ask}\n\n# design\n\nview: the chapter below the Ask\n`;

test("the view reads off the Ask alone, and none names no view", () => {
  assert.equal(
    viewOf(TICKET("view: the sidebar button reads 3")),
    "the sidebar button reads 3",
  );
  assert.equal(viewOf(TICKET("view: none")), "", "none names no view");
  assert.equal(
    viewOf(TICKET("No line.")),
    "",
    "a line under another chapter stands outside the Ask",
  );
  assert.equal(viewOf("no chapters"), "");
});

test("a condition the pull reads holds or skips, and one it lacks skips", () => {
  assert.equal(holdsHere({}, "", {}).holds, true);
  assert.equal(holdsHere({ cloud: true }, "cloud", {}).holds, true);
  assert.equal(holdsHere({ cloud: true }, "desk", {}).holds, false);
  assert.equal(holdsHere({}, "view", {}, TICKET("view: the work tab")).holds, true);
  assert.match(holdsHere({}, "later", {}).why, /names no condition/);
});
