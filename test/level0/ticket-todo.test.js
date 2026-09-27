// The todo flag on the ticket verb, driven through a fake disk: a note parks,
// a standing ticket takes the tag, and --off takes it away.
// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { NOTES, ticket } from "../../src/scripts/ticket.js";
import { at, heard, ROOT, treeWithProcesses } from "./ticket-doors.js";

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket note takes the todo flag, writes the field, and keeps the line clean", () => {
  const said = treeWithProcesses();
  const ran = heard(() =>
    ticket(ROOT, ["note", "slow-lint", "The", "lint", "drags.", "--todo"], said.it),
  );

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(text, /^todo: true$/m);
  assert.match(text, /The lint drags\./);
  assert.doesNotMatch(text, /--todo/);
  assert.match(ran.said, /hands it back first/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a note minted without the flag carries no todo, and reads false", () => {
  const said = treeWithProcesses();
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  assert.doesNotMatch(said.disk.read(at(`${NOTES}/slow-lint.md`)), /^todo:/m);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket todo tags a ticket standing already, and --off takes the tag away", () => {
  const said = treeWithProcesses();
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));

  const on = heard(() => ticket(ROOT, ["todo", "slow-lint"], said.it));
  assert.equal(on.code, 0);
  assert.match(said.disk.read(at(`${NOTES}/slow-lint.md`)), /^todo: true$/m);
  assert.match(on.said, /hands it back first/);

  const off = heard(() => ticket(ROOT, ["todo", "slow-lint", "--off"], said.it));
  assert.equal(off.code, 0);
  assert.doesNotMatch(said.disk.read(at(`${NOTES}/slow-lint.md`)), /^todo:/m);
  assert.match(off.said, /carries no todo/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket todo reaches a tracked ticket too, because the tag reaches any folder", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at("spec/tickets/a-thing.md")]: front });
  const ran = heard(() => ticket(ROOT, ["todo", "a-thing"], said.it));

  assert.equal(ran.code, 0);
  assert.match(said.disk.read(at("spec/tickets/a-thing.md")), /^todo: true$/m);
});

// [[spec/design_output/pull#the-private-queue]]
test("a closed note steps aside for the tracked ticket of its name, and an open one stands first", () => {
  const front = (state) =>
    `---\nkind: [[ticket]]\nstate: ${state}\nurgency: soon\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const shadowed = treeWithProcesses({
    [at(".se/tickets/a-thing.md")]: front("closed"),
    [at("spec/tickets/a-thing.md")]: front("open"),
  });
  heard(() => ticket(ROOT, ["todo", "a-thing"], shadowed.it));
  assert.match(
    shadowed.disk.read(at("spec/tickets/a-thing.md")),
    /^todo: true$/m,
    "the ticket takes the tag",
  );
  assert.ok(
    !/^todo: true$/m.test(shadowed.disk.read(at(".se/tickets/a-thing.md"))),
    "the closed note takes none",
  );

  const live = treeWithProcesses({
    [at(".se/tickets/a-thing.md")]: front("open"),
    [at("spec/tickets/a-thing.md")]: front("open"),
  });
  heard(() => ticket(ROOT, ["todo", "a-thing"], live.it));
  assert.match(
    live.disk.read(at(".se/tickets/a-thing.md")),
    /^todo: true$/m,
    "an open note stands first",
  );
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a ticket riding a branch takes no tag, and the refusal names the branch", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\ngroup: the-flag-parks-work\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at("spec/tickets/a-thing.md")]: front });
  const ran = heard(() => ticket(ROOT, ["todo", "a-thing"], said.it));

  assert.equal(ran.code, 2);
  assert.match(ran.said, /rides the-flag-parks-work/);
  assert.doesNotMatch(said.disk.read(at("spec/tickets/a-thing.md")), /^todo:/m);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("--off reaches a ticket riding a branch, so a tag never sticks", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\ntodo: true\ngroup: the-flag-parks-work\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at("spec/tickets/a-thing.md")]: front });
  const ran = heard(() => ticket(ROOT, ["todo", "a-thing", "--off"], said.it));

  assert.equal(ran.code, 0);
  assert.doesNotMatch(said.disk.read(at("spec/tickets/a-thing.md")), /^todo:/m);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket todo takes a ticket, and names no ticket it fails to find", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => ticket(ROOT, ["todo"], said.it)).code, 2);
  const missing = heard(() => ticket(ROOT, ["todo", "nothing-here"], said.it));
  assert.equal(missing.code, 2);
  assert.match(missing.said, /names no ticket/);
});
