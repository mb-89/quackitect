// The process reader, over a fake disk. It answers a route and its hash, and
// the mint copies both onto a ticket, so every case here reads what it copies.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { processHash, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import {
  askRows,
  nameOf,
  processAt,
  PROCESSES,
  standingIn,
  withRoute,
} from "../../src/scripts/process.js";

const ROOT = "/tree";

const TRIVIAL = `# A fix small enough that the ask is the design.
for: a fix small enough that the ask is the design
ask:
  - name: gain
    form: text
    says: what is gained by doing it
steps:
  - name: do
    does: makes the change
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes and why
`;

const SCHEMA = {
  kind: "ticket",
  frontmatter: {
    properties: { steps: { type: "array" }, process: {}, process_hash: {} },
  },
};

function diskWith(files = {}) {
  return fakeDisk({
    [`${ROOT}/${PROCESSES}/trivial.yaml`]: TRIVIAL,
    [`${ROOT}/${PROCESSES}/note.yaml`]:
      "steps:\n  - name: decide\n    does: says what it becomes\n    to: retro\n",
    ...files,
  });
}

test("a name reads off a word, a path, a link or a file name", () => {
  assert.equal(nameOf("trivial"), "trivial");
  assert.equal(nameOf("[[spec/processes/trivial]]"), "trivial");
  assert.equal(nameOf("spec/processes/trivial.yaml"), "trivial");
});

test("the folder says which processes stand", () => {
  assert.deepEqual(standingIn(diskWith(), ROOT, join), ["note", "trivial"]);
});

test("a process answers its route, its ask and its hash", () => {
  const held = processAt(diskWith(), ROOT, join, "trivial");
  assert.equal(held.link, `${PROCESSES}/trivial`);
  assert.equal(held.route[0].name, "do");
  assert.equal(held.ask[0].name, "gain");
  assert.equal(held.hash, processHash(readYaml(TRIVIAL)));
});

test("a process nothing holds is refused, and the answer names what stands", () => {
  const said = processAt(diskWith(), ROOT, join, "grand");
  assert.match(said.why, /holds no grand/);
  assert.match(said.why, /note, trivial/);
});

test("the mint copies the route, the link and the hash onto the ticket", () => {
  const made = withRoute(diskWith(), ROOT, join, SCHEMA, { process: "trivial" });
  assert.equal(made.fields.process, `${PROCESSES}/trivial`);
  assert.equal(made.fields.process_hash, processHash(readYaml(TRIVIAL)));
  assert.equal(made.fields.steps[0].name, "do");
});

test("the ask reaches the ticket as a comment per field", () => {
  const made = withRoute(diskWith(), ROOT, join, SCHEMA, { process: "trivial" });
  assert.equal(made.fields.Ask, "<!-- gain, as text: what is gained by doing it -->");
  assert.equal(askRows([]), "");
});

test("a caller writing the ask keeps it, and the comment stands down", () => {
  const made = withRoute(diskWith(), ROOT, join, SCHEMA, {
    process: "trivial",
    Ask: "What this ticket asks for.",
  });
  assert.equal(made.fields.Ask, "What this ticket asks for.");
});

test("a kind carrying no route takes no copy", () => {
  const made = withRoute(
    diskWith(),
    ROOT,
    join,
    { frontmatter: { properties: {} } },
    {
      process: "trivial",
    },
  );
  assert.equal(made.fields.steps, undefined);
});

test("a mint naming no process copies nothing", () => {
  const made = withRoute(diskWith(), ROOT, join, SCHEMA, { urgency: "soon" });
  assert.deepEqual(made.fields, { urgency: "soon" });
});
