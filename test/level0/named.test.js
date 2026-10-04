// Every call that writes names the ticket it serves: a patch and a replace in
// their ticket field, a commit at the head of its message. Edit, Write and
// NotebookEdit carry no such field, so the door refuses them.
// [[spec/design_output/level0#a-write-names-its-ticket]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeFront } from "../../src/doors/fake/front.js";
import { patchSpec, replaceSpec } from "../../.claude/skills/level0/lib/apply.js";
import { findings } from "../../.claude/skills/level0/lib/bash.js";
import { UNDO } from "../../.claude/skills/level0/lib/undo.js";
import { SPECS } from "../../src/bridge/apply.js";
import { onToolWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { ticketFault, ticketOf } from "../../src/engine/named.js";
import { commitVerb } from "../../src/scripts/commit-verb.js";
import { quackUnder } from "./quack-doors.js";

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

function commitDoors() {
  const git = fakeGit(
    { "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    ROOT,
  );
  const it = {
    root: ROOT,
    method: ROOT,
    join,
    front: fakeFront(),
    node: "node",
    git,
    disk: fakeDisk(TICKETS),
    log: { say: () => {} },
    vale: { stands: () => true, lint: async () => ({ ran: true, found: [] }) },
    proc: git.proc,
    env: {},
  };
  for (const verb of ["test", "check"]) {
    git.proc.teach([quackUnder(ROOT), "verb", join(ROOT, "src", "scripts"), verb], {
      exitCode: 0,
      stdout: "ok\n",
    });
  }
  return { it, git };
}

const heard = async (what) => {
  const lines = [];
  const was = [console.log, console.error];
  console.log = (...said) => lines.push(said.join(" "));
  console.error = console.log;
  try {
    return { code: await what(), said: lines.join("\n") };
  } finally {
    [console.log, console.error] = was;
  }
};

test("a commit message opening with no ticket, an unknown one or a closed one stages nothing", async () => {
  for (const [message, fault] of [
    ["the change lands", /names no ticket/],
    ["gone: the change lands", /No ticket named gone stands/],
    ["done-one: the change lands", /done-one stands closed/],
  ]) {
    const { it, git } = commitDoors();
    const { code, said } = await heard(() => commitVerb(it, [message]));
    assert.equal(code, 2, message);
    assert.match(said, fault, message);
    assert.match(said, /Open the message with <ticket>:/, message);
    assert.deepEqual(git.ran, [], message);
  }
});

test("a commit message opening with an open ticket lands", async () => {
  const { it, git } = commitDoors();
  const { code } = await heard(() => commitVerb(it, ["open-one: the change lands"]));
  assert.equal(code, 0);
  assert.ok(
    git.ran.some(
      (one) => one.argv.join(" ") === "git commit -m open-one: the change lands",
    ),
  );
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
