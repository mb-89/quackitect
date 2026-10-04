// Every call that writes names the ticket it serves: a patch and a replace in
// their ticket field, a commit at the head of its message, which the Go
// commit verb's own test holds. Edit, Write and
// NotebookEdit carry no such field, so the door refuses them.
// [[spec/design_output/level0#a-write-names-its-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { patchSpec, replaceSpec } from "../../.claude/skills/level0/lib/apply.js";
import { findings } from "../../.claude/skills/level0/lib/bash.js";
import { UNDO } from "../../.claude/skills/level0/lib/undo.js";
import { SPECS } from "../../src/bridge/apply.js";
import { onToolWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { ticketFault, ticketOf } from "../../src/engine/named.js";

const ROOT = "/tree";
const ticket = (state) =>
  `---\nkind: [[ticket]]\nstate: ${state}\n---\n\n# Ask\n\nA thing.\n`;
const TICKETS = {
  "/tree/spec/tickets/open-one.md": ticket("open"),
  "/tree/spec/tickets/done-one.md": ticket("closed"),
  "/tree/.se/tickets/private-one.md": ticket("open"),
};

test("the patch and replace specs require the ticket field", () => {
  for (const spec of [patchSpec(), replaceSpec()]) {
    assert.ok(spec.inputSchema.required.includes("ticket"), spec.name);
    assert.equal(spec.inputSchema.properties.ticket.type, "string", spec.name);
  }
  assert.ok(
    SPECS().every(
      (one) => one.name === UNDO || one.inputSchema.required.includes("ticket"),
    ),
  );
});

test("a Write outside the tree passes, since the write door reads the tree alone", async () => {
  const box = { root: ROOT, disk: fakeDisk(TICKETS) };
  assert.deepEqual(
    await onToolWrite(
      { tool: "Write", file_path: "/elsewhere/a.md", content: "x" },
      box,
    ),
    { pass: true },
  );
});

test("the shell door's refusal names the patch tool and its ticket field, and no road the door refuses", () => {
  const said = findings("cat > spec/guidance/x.md").find(
    (one) => one.rule === "ShellWritesNothing",
  ).message;
  assert.match(said, /mcp__level0__patch/);
  assert.match(said, /ticket field/);
  assert.doesNotMatch(said, /\b(Edit|Write)\b/);
});

test("ticketOf reads the name before the first colon, and nothing where the message opens otherwise", () => {
  assert.equal(ticketOf("open-one: the change lands"), "open-one");
  assert.equal(ticketOf("the change lands"), "");
  assert.equal(ticketOf("the change: lands"), "");
});

test("ticketFault answers nothing for an open ticket, and the fault and the how for the rest", () => {
  const where = { disk: fakeDisk(TICKETS), root: ROOT };
  assert.equal(ticketFault("open-one", where, "HOW"), "");
  assert.equal(ticketFault("private-one", where, "HOW"), "");
  assert.match(ticketFault("", where, "HOW"), /names no ticket\. HOW$/);
  assert.match(
    ticketFault("gone", where, "HOW"),
    /No ticket named gone stands .* HOW$/,
  );
  assert.match(ticketFault("done-one", where, "HOW"), /done-one stands closed\. HOW$/);
});

// A write names what stands in hand: a held ticket or the plan's working todo. [[spec/tickets/the-todo-joins-the-queue]]
const HELD = (ticket) => ({
  "/tree/.se/.runtime/hold/box-1.json": JSON.stringify({
    ticket,
    path: `spec/tickets/${ticket}.md`,
    step: "do",
    hand: "box 1",
  }),
});
const PLAN = (working) => ({
  "/tree/.se/.runtime/plan.json": JSON.stringify({ working, todos: [], places: {} }),
});
const fault = (name, seed) =>
  ticketFault(name, { disk: fakeDisk({ ...TICKETS, ...seed }), root: ROOT }, "How.");

// [[spec/tickets/the-todo-joins-the-queue]]
test("the held ticket passes and a stranger open ticket fails while a hold stands", () => {
  assert.equal(fault("open-one", HELD("open-one")), "");
  const said = fault("private-one", HELD("open-one"));
  assert.match(said, /private-one/);
  assert.match(said, /open-one/, "the refusal names the ticket in hand");
});

// [[spec/tickets/the-todo-joins-the-queue]]
test("the working todo's title passes, and the refusal names the hold and the todo", () => {
  assert.equal(fault("fix the door", PLAN("fix the door")), "");
  const said = fault("open-one", { ...HELD("private-one"), ...PLAN("fix the door") });
  assert.match(said, /private-one/, "it names the hold");
  assert.match(said, /fix the door/, "it names the todo");
});

// An ephemeral ticket stands in the hold alone, so its name passes with no file. [[spec/tickets/the-door-passes-ephemeral-holds]]
test("an ephemeral hold's ticket passes with no file behind it", () => {
  const seed = {
    "/tree/.se/.runtime/hold/box-1.json": JSON.stringify({
      ticket: "clear",
      step: "clear",
      ephemeral: true,
      hand: "box 1",
    }),
  };
  assert.equal(fault("clear", seed), "");
});

// With nothing in hand, any open ticket passes, so the commit verb run by hand still lands. [[spec/tickets/the-open-road-stays-named]]
test("with nothing in hand, any open ticket passes and a closed one fails", () => {
  assert.equal(fault("open-one", {}), "");
  assert.match(fault("done-one", {}), /closed/);
});
