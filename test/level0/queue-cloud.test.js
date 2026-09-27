// The queue reads a group's place in the cloud off the marker its ticket
// carries, and reads no branch for it.
// [[spec/tickets/the-queue-reads-the-marker]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { cloudsIn } from "../../src/scripts/work-answer.js";

const ticket = (name, fields) => ({
  name,
  text: `---\nkind: [[ticket]]\nstate: open\n${fields}---\n\n# Ask\n\nA case.\n`,
});

test("a marked group with no branch reads as the cloud's, and its child with it", () => {
  const said = cloudsIn([
    ticket("far", "cloud: true\n"),
    ticket("far-child", "group: far\n"),
    ticket("near", ""),
  ]);
  assert.deepEqual([...said].sort(), ["far", "far-child"]);
});

test("a group with a branch and no marker reads as the desk's", () => {
  const said = cloudsIn([ticket("near", ""), ticket("near-child", "group: near\n")]);
  assert.deepEqual([...said], []);
});
