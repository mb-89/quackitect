// The route verb, driven through a fake disk. A person edits the steps ahead
// of the pointer, and the verb holds every leaf the ticket already reached.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { ticket } from "../../src/scripts/ticket.js";
import { aheadOnly } from "../../src/scripts/ticket-route.js";
import { TICKET_SCHEMA } from "./fixtures.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const PATH = "spec/tickets/slow-lint.md";

const TICKET = `---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach
      - name: review
        does: reads the approach
  - name: do
    does: makes the change
process: [[spec/processes/standard]]
process_hash: 0123456789abcdef
step: design/review
record:
  - step: design/draft
    hand: box one
---

# Ask

The lint drags.

# design

## draft

## review

# do

# Discussion
`;

const ROUTE = [
  {
    name: "design",
    reads: "[[spec/guidance/voice]]",
    steps: [
      { name: "draft", does: "writes the approach" },
      { name: "review", does: "reads the approach" },
    ],
  },
  { name: "do", does: "makes the change" },
];

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

function routed(steps) {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at(PATH)]: TICKET,
  });
  const flag = typeof steps === "string" ? steps : JSON.stringify(steps);
  const ran = heard(() =>
    ticket(ROOT, ["route", "slow-lint", `--steps=${flag}`], { disk, join }),
  );
  let json = null;
  try {
    json = JSON.parse(ran.said);
  } catch {
    json = null;
  }
  return { ...ran, json, now: disk.read(at(PATH)) };
}

const edited = (change) => change(structuredClone(ROUTE));

test("a step past the pointer lands, and the record and the hash stay as they stood", () => {
  const said = routed(
    edited((route) => {
      route.push({ name: "sign", does: "says yes or no", by: "person" });
      return route;
    }),
  );
  assert.equal(said.code, 0);
  assert.match(said.now, /- name: sign/);
  assert.match(said.now, /by: person/);
  assert.match(said.now, /^process_hash: 0123456789abcdef$/m);
  assert.match(said.now, /- step: design\/draft\n\s+hand: box one/);
  assert.match(said.now, /^step: design\/review$/m);
});

test("a write prints the ticket, the pointer and the route it leaves, as JSON", () => {
  const route = edited((one) => {
    one[1].does = "makes the change, and its test";
    return one;
  });
  const said = routed(route);
  assert.equal(said.code, 0);
  assert.deepEqual(said.json, { ticket: PATH, step: "design/review", steps: route });
});

test("a changed leaf the ticket reached is refused, named, and nothing is written", () => {
  const said = routed(
    edited((route) => {
      route[0].steps[0].does = "writes a different approach";
      return route;
    }),
  );
  assert.equal(said.code, 1);
  assert.equal(said.json.at, "design/draft");
  assert.match(said.json.refused, /design\/draft/);
  assert.equal(said.now, TICKET);
});

test("a dropped leaf the record names is refused, and named", () => {
  const said = routed(
    edited((route) => {
      route[0].steps.shift();
      return route;
    }),
  );
  assert.equal(said.code, 1);
  assert.equal(said.json.at, "design/draft");
  assert.equal(said.now, TICKET);
});

test("a step moved ahead of a reached leaf is refused, and names the leaf it displaces", () => {
  const said = routed(
    edited((route) => {
      route[0].steps.splice(1, 0, { name: "sketch", does: "draws a picture" });
      return route;
    }),
  );
  assert.equal(said.code, 1);
  assert.equal(said.json.at, "design/review");
  assert.equal(said.now, TICKET);
});

test("a changed field on a phase holding a reached leaf is refused, and names the phase", () => {
  const said = routed(
    edited((route) => {
      route[0].reads = "[[spec/guidance/working]]";
      return route;
    }),
  );
  assert.equal(said.code, 1);
  assert.equal(said.json.at, "design");
  assert.equal(said.now, TICKET);
});

test("a new step joins a phase holding a reached leaf, past the pointer", () => {
  const said = routed(
    edited((route) => {
      route[0].steps.push({ name: "sign", does: "says yes", by: "person" });
      return route;
    }),
  );
  assert.equal(said.code, 0);
  assert.match(said.now, /- name: sign/);
});

test("a route without the pointer's leaf is refused, and names the pointer", () => {
  const said = routed(
    edited((route) => {
      route[0].steps.pop();
      return route;
    }),
  );
  assert.equal(said.code, 1);
  assert.equal(said.json.at, "design/review");
  assert.match(said.json.refused, /pointer/);
});

test("a flag holding no JSON list is refused, and says the flag it wants", () => {
  for (const flag of ["not json", '{"name":"do"}']) {
    const said = routed(flag);
    assert.equal(said.code, 1);
    assert.match(said.json.refused, /--steps=/);
    assert.equal(said.now, TICKET);
  }
});

test("aheadOnly passes a route whose reached leaves stand as they stood", () => {
  const front = {
    step: "design/review",
    record: [{ step: "design/draft" }],
    steps: ROUTE,
  };
  assert.deepEqual(aheadOnly(front, ROUTE), { steps: ROUTE });
});
