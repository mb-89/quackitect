// The fill verb, over a fake disk. A person saves a ticket naming a process
// and no route, and the fill writes what the mint writes for it.
// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { verbs } from "../../src/scripts/cli.js";
import { ticket } from "../../src/scripts/ticket.js";
import { TICKET_SCHEMA, TRIVIAL_PROCESS } from "./fixtures.js";
import { heard } from "./pull-doors.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const PATH = "spec/tickets/slow-lint.md";

const SAVED = `---
kind: [[ticket]]
process: [[spec/processes/trivial]]
---

# Ask

The lint drags on every save.
`;

function filled(text, flags = []) {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at("spec/processes/trivial.yaml")]: TRIVIAL_PROCESS,
    [at(PATH)]: text,
  });
  const ran = heard(() => ticket(ROOT, ["fill", PATH, ...flags], { disk, join }));
  return { ...ran, now: disk.read(at(PATH)) };
}

test("fill --stdout prints the ticket the mint writes, and writes no file", () => {
  const said = filled(SAVED, ["--stdout"]);
  assert.equal(said.code, 0);
  assert.match(said.said, /^state: draft$/m);
  assert.match(said.said, /^steps:\n\s+- name: do/m);
  assert.match(said.said, /^process_hash: [0-9a-f]{16}$/m);
  assert.match(said.said, /^# do$/m, "a chapter stands for the step");
  assert.match(said.said, /The lint drags on every save\./, "the ask the person wrote stays");
  assert.equal(said.now, SAVED);
});

test("fill writes the filled ticket over the path, and answers JSON", () => {
  const said = filled(SAVED);
  assert.equal(said.code, 0);
  assert.deepEqual(JSON.parse(said.said), {
    ticket: PATH,
    process: "spec/processes/trivial",
  });
  assert.match(said.now, /^process_hash: [0-9a-f]{16}$/m);
  assert.match(said.now, /The lint drags on every save\./);
});

test("fill over a ticket whose route stands copies nothing, and says so", () => {
  const routed = filled(SAVED).now;
  const said = filled(routed);
  assert.equal(said.code, 0);
  assert.match(said.said, /carries a route already/);
  assert.equal(said.now, routed);
});

test("fill over a ticket naming no process refuses, and writes nothing", () => {
  const bare = SAVED.replace("process: [[spec/processes/trivial]]\n", "process:\n");
  const said = filled(bare);
  assert.equal(said.code, 2);
  assert.match(said.said, /Name a process/);
  assert.equal(said.now, bare);
});

test("the command line's ticket entry names the fill verb", () => {
  assert.match(verbs.ticket.says, /\bfill\b/);
});

test("fill over a path standing nowhere refuses with exit 2", () => {
  const disk = fakeDisk({ [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA });
  const ran = heard(() => ticket(ROOT, ["fill", "spec/tickets/nowhere.md"], { disk, join }));
  assert.equal(ran.code, 2);
  assert.match(ran.said, /names no ticket/);
});
