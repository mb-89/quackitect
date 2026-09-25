// The strings behind the work group: the line a config entry runs, the count
// and the next ticket the verbs answer, and the new ticket's path and text.
// [[spec/tickets/the-work-group-draws-buttons]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countIn,
  lineArgvOf,
  NEW_TICKET,
  nextIn,
  ticketPathOf,
} from "../../src/extension/lib/work.js";

test("a config line drops its RUNME head and splits into the verb's argv", () => {
  assert.deepEqual(lineArgvOf("./RUNME.sh ticket yours --count"), ["ticket", "yours", "--count"]);
  assert.deepEqual(lineArgvOf("ticket yours --next"), ["ticket", "yours", "--next"]);
  assert.deepEqual(lineArgvOf(""), []);
});

test("the count reads off the verb's JSON, and a refusal reads as none", () => {
  assert.equal(countIn({ code: 0, out: '{"count":3}\n' }), 3);
  assert.equal(countIn({ code: 1, out: "" }), undefined);
  assert.equal(countIn({ code: 0, out: "no json" }), undefined);
});

test("the next ticket reads off the verb's JSON, and an empty queue reads as none", () => {
  const out = JSON.stringify({ ticket: "one", path: "spec/tickets/one.md", step: "do" });
  assert.deepEqual(nextIn({ code: 0, out }), { ticket: "one", path: "spec/tickets/one.md" });
  assert.equal(nextIn({ code: 0, out: '{"ticket":null}' }), null);
  assert.equal(nextIn({ code: 1, out: "" }), null);
});

test("a name takes the ticket path, and a name outside the ticket form takes none", () => {
  const opens = "spec/tickets/<name>.md";
  assert.equal(ticketPathOf(opens, "slow-lint"), "spec/tickets/slow-lint.md");
  assert.equal(ticketPathOf(opens, " slow-lint "), "spec/tickets/slow-lint.md");
  for (const bad of ["", "../escape", "a/b", "Slow Lint", "-lead", "a..b"])
    assert.equal(ticketPathOf(opens, bad), "", bad);
});

test("a new ticket carries its kind and an empty process, and an ask to fill", () => {
  assert.match(NEW_TICKET, /^---\nkind: \[\[ticket\]\]\nprocess: ""\n---\n/);
  assert.match(NEW_TICKET, /^# Ask$/m);
});

test("an answer of the wrong shape reads as none", () => {
  assert.equal(countIn({ code: 0, out: '{"count":"3"}' }), undefined);
  assert.equal(nextIn({ code: 0, out: '{"ticket":"one"}' }), null);
});
