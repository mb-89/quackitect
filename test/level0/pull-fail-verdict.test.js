// The fail through the verdict field: the field decides, a craft question rides
// the fail, and a fail runs the step's commands for the record.
// [[spec/design_output/pull#the-fail]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeFront } from "../../src/doors/fake/front.js";
import { fieldOf, recordIn, withEntry } from "../../src/engine/group.js";
import { withPayload } from "../../src/scripts/pull.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, filled, heard, ROOT, SHA, standing } from "./pull-doors.js";

// [[spec/design_output/pull#the-fail]]
test("a verdict field decides, the flag is refused there, and a fail sends the ticket back with a return", () => {
  const took = withEntry(
    CHILD("open", "design/review"),
    {
      step: "design/draft",
      hand: "box other",
      hash_before: SHA,
      hash_after: SHA,
    },
    fakeFront(),
  );
  const { it, disk } = doors(standing(took));
  heard(() => pulling(ROOT, ["pull"], it));

  const flagged = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(flagged.code, 1);
  assert.match(flagged.said, /the field decides and the flag stays off/);

  disk.write(
    at("spec/tickets/a-child.md"),
    filled(took, "### verdict", "fail\n- the approach names no test"),
  );
  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/draft");
  const entry = recordIn(now).at(-1);
  assert.equal(entry.step, "design/review");
  assert.equal(entry.returns, 1);
  assert.equal(entry.why, "the approach names no test");
  assert.match(said, /fails design\/review back to design\/draft/);
});

// A craft question rides the fail verdict, so the route grows no person step. [[spec/tickets/a-question-reaches-its-owner]]
test("a craft question reaches the drafter, and the route takes on no person step", () => {
  const took = withEntry(
    CHILD("open", "design/review"),
    {
      step: "design/draft",
      hand: "box other",
      hash_before: SHA,
      hash_after: SHA,
    },
    fakeFront(),
  );
  const { it, disk } = doors(standing(took));
  heard(() => pulling(ROOT, ["pull"], it));

  const craft = "which road the reader takes inside the design";
  disk.write(
    at("spec/tickets/a-child.md"),
    filled(took, "### verdict", `fail\n- ${craft}`),
  );
  const { code } = heard(() => pulling(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "step"), "design/draft", "the drafter takes it back");
  assert.match(recordIn(now).at(-1).why, /which road the reader takes/);
  assert.doesNotMatch(now, /person-\d/, "a craft question inserts no person step");
  assert.doesNotMatch(now, /by: person/, "and names no person as its hand");
});

// A step whose evidence stands red is a step a hand fails. [[spec/design_output/pull#the-fail]]
test("a fail runs the step's commands for the record, and none of them refuses it", () => {
  const child = withPayload(
    CHILD("open", "implement/tests-red"),
    "implement/tests-red",
    '{"tests": "node --test", "checked": "- the ask names them\\n- every door has a fake"}',
  ).text;
  const { it, disk } = doors(standing(child));
  it.proc.teach(["sh", "-c", "node --test"], {
    exitCode: 0,
    stdout: "green, every test passes",
  });
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() =>
    pulling(
      ROOT,
      ["pull", "a-child", "--fail", "no test stands red, so the step reads wrong"],
      it,
    ),
  );

  assert.equal(code, 0, said);
  const entry = recordIn(disk.read(at("spec/tickets/a-child.md"))).at(-1);
  assert.equal(entry.returns, 1);
  assert.equal(entry.why, "no test stands red, so the step reads wrong");
  assert.equal(entry.answered[0].name, "tests");
  assert.equal(entry.answered[0].exit, 0);
});
