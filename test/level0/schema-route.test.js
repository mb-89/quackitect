// The schema reader and the note checker: a route: its steps, its evidence and the chapters under it.
// A route is a tree of steps, so a case here feeds a bad one and reads the line
// the finding stands on.

import assert from "node:assert/strict";
import { test } from "node:test";
import { placeholderFaults } from "../../.claude/skills/level0/lib/schema-body.js";
import { mintNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { readNote } from "../../.claude/skills/level0/lib/schema-read.js";
import { ROUTE, ROUTED, routed } from "./schema-notes.js";

const route = `---
kind: [[routed]]
step: design/review
steps:
  - name: design
    steps:
      - name: draft
        does: writes the design
      - name: review
        does: reads the design
        by: not draft
        on_fail: draft
  - name: ship
    does: ships it
    on_fail: design/review
---

# Ask

What it asks for.

# design

## draft

## review

# ship
`;

// [[spec/design_output/schema#a-line-per-nested-key]]
test("the reader keeps a line per key, at every depth of a nested list", () => {
  const note = readNote(route);
  assert.equal(note.front.lines.steps, 4, "a top-level key reads as it reads today");
  assert.equal(note.front.lines["steps[0].name"], 5);
  assert.equal(note.front.lines["steps[0].steps[1].by"], 11);
  assert.equal(note.front.lines["steps[1].on_fail"], 15);
});

// [[spec/design_output/schema#the-checker-walks-every-key]]
test("a route in the shape its schema names breaks no rule", () => {
  assert.deepEqual(routed(route), []);
});

// [[spec/design_output/schema#the-checker-walks-every-key]]
test("a field the schema never names under a step is refused, with its own line", () => {
  const one = routed(
    route.replace("        does: reads the design", "        about: a thing"),
  )[0];
  assert.equal(one.rule, "Schema.about");
  assert.equal(one.line, 10, "it points at the line the nested key stands on");
  assert.match(one.message, /names no about under steps\[0\]\.steps\[1\]/);
});

// [[spec/design_output/schema#the-checker-walks-every-key]]
test("a step short of the name every entry carries is refused", () => {
  const bad = routed(
    route.replace("      - name: draft\n", "      - does: writes it\n"),
  );
  const one = bad.find((held) => held.rule === "Schema.name");
  assert.ok(one, "the checker names the missing key");
  assert.match(one.message, /steps\[0\]\.steps\[0\] names name/);
});

// [[spec/design_output/schema#the-checker-walks-every-key]]
test("an evidence field off its enum is refused two lists deep", () => {
  const said = `${route.replace(
    "        does: reads the design",
    `        does: reads the design
        evidence:
          - name: verdict
            form: picture
            says: pass or fail`,
  )}\n### verdict\n`;
  const one = routed(said).find((held) => held.rule === "Schema.form");
  assert.ok(one, "the checker reaches the form of an evidence field");
  assert.match(one.message, /text, command/);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a value naming no step is refused, and the refusal names every step", () => {
  const one = routed(route.replace("on_fail: draft", "on_fail: nowhere"))[0];
  assert.equal(one.rule, "Schema.OnFail");
  assert.match(one.message, /names nowhere, and steps holds/);
  assert.match(one.message, /design\/draft/);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a value naming a step at or after its own is refused", () => {
  const one = routed(route.replace("on_fail: draft", "on_fail: ship"))[0];
  assert.equal(one.rule, "Schema.OnFail");
  assert.match(one.message, /standing before design\/review/);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a name reads a sibling first, and a path with a slash says exactly", () => {
  assert.deepEqual(
    routed(route.replace("on_fail: draft", "on_fail: design/draft")),
    [],
  );
  assert.deepEqual(
    routed(route.replace("on_fail: design/review", "on_fail: design")),
    [],
  );
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a step naming a phase where the schema names a leaf is refused", () => {
  const one = routed(route.replace("step: design/review", "step: design"))[0];
  assert.equal(one.rule, "Schema.step");
  assert.match(one.message, /names a leaf, and design holds steps/);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a word the rule passes over stands, and a prefix names the step after it", () => {
  assert.deepEqual(routed(route.replace("by: not draft", "by: anyone")), []);
  assert.ok(routed(route.replace("by: not draft", "by: not nowhere")).length);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a chapter missing for a step is refused, and a chapter naming none too", () => {
  const gone = routed(route.replace("## review\n", ""));
  assert.deepEqual(
    gone.map((one) => one.rule),
    ["Schema.review"],
  );
  assert.match(gone[0].message, /carries a review chapter/);

  const extra = routed(`${route}\n## stranger\n`);
  assert.deepEqual(
    extra.map((one) => one.rule),
    ["Schema.stranger"],
  );
  assert.match(extra[0].message, /names no stranger chapter/);
});

// [[spec/design_output/schema#the-render-follows-the-tree]]
test("mint writes the route as a block, and a chapter per step under it", () => {
  const text = mintNote(ROUTED);
  assert.match(text, /steps:\n {2}- name: do\n {4}does: makes the change\n/);
  assert.match(text, /# do\n\n<!-- makes the change -->\n/);
  assert.match(
    text,
    /## change\n\n<!-- what you change -->\n\n<!-- the form is text -->/,
  );
  assert.deepEqual(routed(text), [], "the note mint writes passes the checker");
});

// [[spec/design_output/schema#a-placeholder-stands-at-warning]]
test("a field stands at warning while it is empty, and a step's chapter never does", () => {
  const left = placeholderFaults(mintNote(ROUTED), ROUTED, ROUTE);
  assert.deepEqual(
    left.map((one) => one.message.split(" ")[0]),
    ["Ask", "change"],
    "the hand fills the ask and the field, and a step's chapter holds its fields",
  );
});
