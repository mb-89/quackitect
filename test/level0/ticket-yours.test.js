// The yours verb, over a fake disk and a fake git. A ticket waits on a person
// where it stands open and its pointer's leaf carries `by: person`.
// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { verbs } from "../../src/scripts/cli.js";
import { taggedFirst } from "../../src/scripts/pull-hand.js";
import { ticket } from "../../src/scripts/ticket.js";
import { waiting } from "../../src/scripts/ticket-yours.js";

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

function asked(files, argv) {
  const disk = fakeDisk(Object.fromEntries(Object.entries(files).map(([k, v]) => [at(k), v])));
  const ran = heard(() => ticket(ROOT, ["yours", ...argv], { disk, join, git: fakeGit() }));
  let json = null;
  try {
    json = JSON.parse(ran.said);
  } catch {
    json = null;
  }
  return { ...ran, json };
}

const TREE = {
  "spec/tickets/a-later-one.md": ticketText(),
  "spec/tickets/b-urgent-one.md": ticketText({ extra: "urgent: true\n" }),
  "spec/tickets/c-agent-one.md": ticketText({ by: "agent" }),
  "spec/tickets/d-draft-one.md": ticketText({ state: "draft" }),
  "spec/tickets/e-closed-one.md": ticketText({ state: "closed" }),
};

test("waiting keeps the open tickets whose pointer's leaf a person holds", () => {
  const all = Object.entries(TREE).map(([path, text]) => ({
    name: path.split("/").pop().replace(/\.md$/, ""),
    path,
    text,
  }));
  assert.deepEqual(
    waiting(all).map((one) => one.name),
    ["a-later-one", "b-urgent-one"],
  );
});

test("yours --count prints the count waiting on a person, as JSON", () => {
  const said = asked(TREE, ["--count"]);
  assert.equal(said.code, 0);
  assert.deepEqual(said.json, { count: 2 });
});

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
    { ...TREE, "spec/tickets/f-tagged-one.md": ticketText({ extra: "todo: true\n" }) },
    ["--next"],
  );
  assert.equal(said.json?.ticket, "f-tagged-one");
});

test("yours --next with nothing waiting prints a null ticket, and exits 0", () => {
  const said = asked({ "spec/tickets/c-agent-one.md": TREE["spec/tickets/c-agent-one.md"] }, [
    "--next",
  ]);
  assert.equal(said.code, 0);
  assert.deepEqual(said.json, { ticket: null });
});

test("bare yours lists every ticket waiting, in queue order", () => {
  const said = asked(TREE, []);
  assert.deepEqual(
    (said.json?.tickets ?? []).map((one) => one.ticket),
    ["b-urgent-one", "a-later-one"],
  );
  assert.equal(said.json?.tickets?.[1]?.step, "sign");
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
  assert.deepEqual(
    waiting([{ name: "a-phase-one", path: "spec/tickets/a-phase-one.md", text }]).map(
      (one) => one.name,
    ),
    ["a-phase-one"],
  );
});

test("taggedFirst keeps the tagged tickets first as listed, and scores the rest", () => {
  const one = (name, front) => ({ name, path: `${name}.md`, text: "", front });
  const list = [one("a", {}), one("b", { todo: true }), one("c", {}), one("d", { todo: true })];
  assert.deepEqual(
    taggedFirst(list).map((it) => it.name),
    ["b", "d", "a", "c"],
  );
});
