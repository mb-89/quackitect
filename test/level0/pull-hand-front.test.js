// The person-step repair writes the route through the front door, so the
// question a step asks comes back quoted and the engine named as its reader.
// [[spec/tickets/go-writes-the-frontmatter]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { withEngineReader } from "../../src/scripts/pull-hand.js";
import { CHILD, doors, standing } from "./pull-doors.js";

const ASKS = "which road: the first or the second";

test("a person step takes the engine as its reader, and its question reads back whole", () => {
  const text = CHILD("open", "design/draft").replace(
    "      - name: review\n",
    `      - name: person\n        by: person\n        asks: ${ASKS}\n      - name: review\n`,
  );
  const { it } = doors(standing(text));
  const put = withEngineReader(it, { text });
  assert.match(put, /\n {8}asks: "which road: the first or the second"\n/);
  const person = readNote(put).front.said.steps[0].steps[1];
  assert.equal(person.to, "engine");
  assert.equal(person.asks, ASKS);
});
