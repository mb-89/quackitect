// The yours verb, over a fake disk and a fake git. It reads the answer the work
// tab reads, so it lists the rows the tab's queue places.
// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { verbs } from "../../src/scripts/cli.js";
import { taggedFirst } from "../../src/scripts/pull-hand.js";
import { ticket } from "../../src/scripts/ticket.js";
import { answerOf } from "../../src/scripts/work-answer.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

function ticketText({ state = "open", by = "person", extra = "" } = {}) {
  return `---
kind: [[ticket]]
state: ${state}
${extra}steps:
  - name: do
    does: makes the change
  - name: sign
    does: says yes or no
    by: ${by}
step: sign
---

# Ask

A thing.
`;
}

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
  }
}

function doorsOf(files) {
  const disk = fakeDisk(
    Object.fromEntries(Object.entries(files).map(([k, v]) => [at(k), v])),
  );
  return { disk, join, git: fakeGit() };
}

function asked(files, argv) {
  const ran = heard(() => ticket(ROOT, ["yours", ...argv], doorsOf(files)));
  let json = null;
  try {
    json = JSON.parse(ran.said);
  } catch {
    json = null;
  }
  return { ...ran, json };
}

// The count src/tui/work/workplaces.go draws behind the tab's name: each name's last place, off the cloud. [[spec/design_output/tui#the-work-tab]]
function tabCount(files) {
  const answer = answerOf(
    { root: ROOT, method: ROOT, work: ROOT, ...doorsOf(files) },
    true,
  );
  const places = new Map();
  for (const one of answer.branches) {
    if (one.queue) places.set(one.name, one.queue);
    for (const child of one.tickets)
      if (child.queue) places.set(child.name, child.queue);
  }
  for (const one of answer.loose) if (one.queue) places.set(one.name, one.queue);
  return [...places.values()].filter((place) => place !== "∞").length;
}

const NOTE_TEXT = ticketText({ extra: "process: [[spec/processes/note]]\n" });

const TREE = {
  "spec/tickets/a-later-one.md": ticketText(),
  "spec/tickets/b-urgent-one.md": ticketText({ extra: "urgent: true\n" }),
  "spec/tickets/c-agent-one.md": ticketText({ by: "agent" }),
  "spec/tickets/d-draft-one.md": ticketText({ state: "draft" }),
  "spec/tickets/e-closed-one.md": ticketText({ state: "closed" }),
  ".se/tickets/f-note-one.md": NOTE_TEXT,
};

test("yours --next prints the ticket the queue hands a person first, as JSON", () => {
  const said = asked(TREE, ["--next"]);
  assert.equal(said.code, 0);
  assert.deepEqual(said.json, {
    ticket: "b-urgent-one",
    path: "spec/tickets/b-urgent-one.md",
    step: "sign",
  });
});

test("a tagged ticket stands first, ahead of the score", () => {
  const said = asked(
    { ...TREE, "spec/tickets/g-tagged-one.md": ticketText({ extra: "todo: true\n" }) },
    ["--next"],
  );
  assert.equal(said.json?.ticket, "g-tagged-one");
});

test("yours --next with no open person's step prints a null ticket, and exits 0", () => {
  const said = asked(
    {
      "spec/tickets/c-agent-one.md": TREE["spec/tickets/c-agent-one.md"],
      ".se/tickets/f-note-one.md": NOTE_TEXT,
      "spec/tickets/d-draft-one.md": TREE["spec/tickets/d-draft-one.md"],
    },
    ["--next"],
  );
  assert.equal(said.code, 0);
  assert.deepEqual(said.json, { ticket: null });
});

test("bare yours lists every row the queue places, in its order", () => {
  const said = asked(TREE, []);
  const rows = said.json?.tickets ?? [];
  assert.equal(rows.length, tabCount(TREE));
  assert.deepEqual(
    rows.filter((one) => one.person).map((one) => one.ticket),
    ["b-urgent-one", "a-later-one", "d-draft-one"],
  );
  assert.equal(rows[0].ticket, "b-urgent-one");
  assert.equal(rows[0].step, "sign");
});

test("the command line's ticket entry names the yours verb", () => {
  assert.match(verbs.ticket.says, /\byours\b/);
});

test("a person named on the phase holds each leaf under it", () => {
  const text = `---
kind: [[ticket]]
state: open
steps:
  - name: sign
    by: person
    steps:
      - name: read
        does: reads the change
step: sign/read
---
`;
  const said = asked({ "spec/tickets/a-phase-one.md": text }, ["--next"]);
  assert.equal(said.json?.ticket, "a-phase-one");
});

test("taggedFirst keeps the tagged tickets first as listed, and scores the rest", () => {
  const one = (name, front) => ({ name, path: `${name}.md`, text: "", front });
  const list = [
    one("a", {}),
    one("b", { todo: true }),
    one("c", {}),
    one("d", { todo: true }),
  ];
  assert.deepEqual(
    taggedFirst(list).map((it) => it.name),
    ["b", "d", "a", "c"],
  );
});

test("a ticket with no pointer reads its first leaf, as the pull reads it", () => {
  const text = `---
kind: [[ticket]]
state: open
steps:
  - name: sign
    by: person
---
`;
  const said = asked({ "spec/tickets/a.md": text }, ["--next"]);
  assert.equal(said.json?.ticket, "a");
});
