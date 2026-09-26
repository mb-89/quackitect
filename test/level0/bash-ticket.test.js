// Every Bash or PowerShell call names the open ticket it serves, at the head
// of its description, the way a patch names it in its ticket field.
// [[spec/design_output/level0#a-shell-names-its-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { freeOfTicket } from "../../.claude/skills/level0/lib/bash.js";
import { onBash, onPowerShell } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { NAMED, named } from "./fixtures.js";

const ROOT = "/tree";
const CLOSED = {
  [`${ROOT}/spec/tickets/done-one.md`]:
    "---\nkind: [[ticket]]\nstate: closed\n---\n\n# Ask\n",
};

function box(seed = {}) {
  return {
    env: {},
    disk: fakeDisk({ ...named(ROOT), ...CLOSED, ...seed }),
    proc: fakeProc({}),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");
const opens = (ticket, what) => `${ticket}: ${what}`;

test("freeOfTicket reads a pull, a mint and a note as free, and every other command as bound", () => {
  for (const command of [
    "./RUNME.sh ticket pull",
    "./RUNME.sh ticket pull a-child --pass",
    "./RUNME.sh mint ticket spec/tickets/fresh.md --process=standard",
    './RUNME.sh ticket note a-thought "a line to keep"',
  ]) {
    assert.equal(freeOfTicket(command), true, command);
  }
  for (const command of [
    "git status",
    "git commit -m x",
    "./RUNME.sh branch done",
    "./RUNME.sh ticket pull && git commit -m x",
    "",
  ]) {
    assert.equal(freeOfTicket(command), false, command);
  }
});

test("a Bash call naming no description refuses, and names the form", async () => {
  const found = denied(await onBash({ command: "git status" }, box()));
  assert.match(found, /names no ticket/);
  assert.match(found, /<ticket>:/);
});

test("a description naming no ticket, an unknown ticket and a closed ticket all refuse", async () => {
  for (const [description, fault] of [
    ["fix the lint", /names no ticket/],
    ["gone: fix the lint", /No ticket named gone stands/],
    ["done-one: fix the lint", /done-one stands closed/],
  ]) {
    const found = denied(await onBash({ command: "git status", description }, box()));
    assert.match(found, fault, description);
  }
});

test("a description naming an open ticket passes", async () => {
  const found = denied(
    await onBash(
      { command: "git status", description: opens(NAMED, "read the state") },
      box(),
    ),
  );
  assert.equal(found, "");
});

test("a pull, a mint and a note pass with no ticket named", async () => {
  for (const command of [
    "./RUNME.sh ticket pull",
    "./RUNME.sh mint ticket spec/tickets/fresh.md --process=standard",
    './RUNME.sh ticket note a-thought "a line to keep"',
  ]) {
    assert.equal(denied(await onBash({ command }, box())), "", command);
  }
});

test("PowerShell meets the same door, unnamed and named alike", async () => {
  assert.match(
    denied(await onPowerShell({ command: "Get-ChildItem" }, box())),
    /names no ticket/,
  );
  assert.equal(
    denied(
      await onPowerShell(
        {
          command: "Get-ChildItem",
          description: opens(NAMED, "list the tree"),
        },
        box(),
      ),
    ),
    "",
  );
  assert.equal(
    denied(await onPowerShell({ command: "./RUNME.sh ticket pull" }, box())),
    "",
  );
});

// A description opening on the working todo's title and a colon names what stands in hand. [[spec/tickets/the-todo-joins-the-queue]]
test("a description opening on the working todo's title and a colon passes", async () => {
  const plan = {
    [`${ROOT}/.se/.runtime/plan.json`]: JSON.stringify({
      working: "fix the door",
      todos: [],
      places: {},
    }),
  };
  const found = denied(
    await onBash(
      { command: "git status", description: "fix the door: read the state" },
      box(plan),
    ),
  );
  assert.equal(found, "");
});
