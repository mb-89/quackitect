// The clear over a served box: a retro in the session's own hand keeps the
// conversation, a helper's retro and any other ticket clear under the queue,
// and a binding changed in its file writes a line at the next prompt.
// [[spec/tickets/the-retro-holds-the-clear]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { clearsHere } from "../../src/bridge/handover.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { BOX } from "../../src/scripts/pull-hand-of.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const MINE = "box b1 · claude-code";
const CONFIG = { engine: { binding: "queue" } };
const RETRO =
  "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/retro]]\n---\n";
const STANDARD =
  "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/standard]]\n---\n";

function served(holds = {}) {
  const files = {
    [at("spec/config/level0.json")]: JSON.stringify(CONFIG),
    [at(TOOLS)]: "{}",
    [at(BOX)]: JSON.stringify({ id: "b1" }),
    [at("spec/tickets/retro-1.md")]: RETRO,
    [at("spec/tickets/a-child.md")]: STANDARD,
  };
  for (const [name, held] of Object.entries(holds)) {
    files[at(`${HOLDS}/${name}.json`)] = JSON.stringify(held);
  }
  return boxOf(ROOT, ROOT, {
    disk: fakeDisk(files),
    clock: fakeClock(),
    proc: fakeProc({}),
    log: fakeLog(),
    env: { CLAUDECODE: "1" },
    index: { warm: () => ({ warmed: false }), dead: () => "" },
  });
}

const held = (ticket, step, hand) => ({
  ticket,
  path: `spec/tickets/${ticket}.md`,
  step,
  hand,
});

test("a retro in the session's own hand keeps the conversation", () => {
  assert.equal(clearsHere(served({ one: held("retro-1", "write", MINE) })), false);
});

test("a group's retro step in the session's own hand keeps the conversation", () => {
  assert.equal(
    clearsHere(served({ one: held("a-child", "retro/notes", MINE) })),
    false,
  );
});

test("a helper holding a retro leaves the session clearing under the queue", () => {
  assert.equal(
    clearsHere(served({ one: held("retro-1", "write", `${MINE} · helper-2`) })),
    true,
  );
});

test("a hold on any other ticket clears under the queue", () => {
  assert.equal(
    clearsHere(served({ one: held("a-child", "design/draft", MINE) })),
    true,
  );
});

// [[spec/design_output/stop#a-refusal-names-the-binding]]
test("a binding changed in its file writes a line at the next prompt, naming the layer", async () => {
  const box = served();
  const prompt = () =>
    decide(
      { event: "prompt.submit", e: { origin: { kind: "composer" }, text: "go on" } },
      box,
    );
  await prompt();
  box.disk.write(
    at(".se/.runtime/config.json"),
    JSON.stringify({ engine: { binding: "god" } }),
  );
  await prompt();
  const lines = box.log.lines().filter((one) => one.kind === "binding");
  assert.equal(lines.length, 2, "the first read and the change each write one");
  assert.match(lines.at(-1).said, /the binding reads god/);
  assert.match(String(lines.at(-1).detail), /config\.json/);
});
