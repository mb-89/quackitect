// What a hand meets at the pull: the step in hand alone, and a payload the
// engine formats before it merges. The doors stand in pull-doors.js.
// [[spec/design_output/pull#the-fields-ride-the-payload]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeFront } from "../../src/doors/fake/front.js";
import { withField } from "../../src/engine/group.js";
import { withPayload } from "../../src/scripts/pull-chapter.js";
import { formatted } from "../../src/scripts/pull-format.js";
import { spawnPrompt } from "../../src/scripts/pull-spawn.js";
import { pulling } from "../../src/scripts/work.js";
import { CHILD, doors, GROUP_NOTE, heard, ROOT, standing } from "./pull-doors.js";

// [[spec/design_output/pull#what-a-hand-out-reads]]
test("the hand-out names the step in hand and no other leaf", () => {
  const { it } = doors(
    standing(CHILD(), withField(GROUP_NOTE, "step", "children", fakeFront())),
  );
  const took = heard(() => pulling(ROOT, ["pull"], it));

  assert.match(took.said, /^work {2}a-child at design\/draft/m);
  assert.match(took.said, /approach/, "the leaf's own field stands");
  assert.match(took.said, /--fields/, "the hand-out names the payload");
  assert.doesNotMatch(took.said, /\bverdict\b|\blint\b/, "no field of another leaf");
  assert.doesNotMatch(took.said, /Write under/, "and it sends no hand into the file");
});

// [[spec/design_output/pull#the-fields-ride-the-payload]]
test("a payload lands formatted before the checks read it", () => {
  assert.equal(formatted("* one  \n\n\n* two\t"), "- one\n\n- two");
  const put = withPayload(
    CHILD("open", "implement/tests-red"),
    "implement/tests-red",
    JSON.stringify({ tests: "node --test   " }),
  );
  assert.match(put.text, /### tests\n\nnode --test\n\n## change/);
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the spawn prompt hands a helper the payload, and sends it into no file", () => {
  const leaf = {
    path: "design/review",
    evidence: [{ name: "verdict", form: "verdict" }],
  };
  const said = spawnPrompt("a-child", leaf, "helper-2");

  assert.match(said, /--as helper-2 --fields '<json>'/);
  assert.match(said, /The engine writes the ticket/);
  assert.doesNotMatch(said, /Write the fields into the ticket/);
});
