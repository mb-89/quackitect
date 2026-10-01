// The answer before the stop call streams as turn.said, and a report there
// stands for the turn, so the stop line after the call comes alone.
// [[spec/tickets/the-stop-asks-one-line]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: the-owner-asks-to-talk
  side: stop
  priority: 100
  decides: claimed
  runs: a-report-stands
  asks: Does the last thing the owner said open a discussion, and does this message carry the report?
  says: The owner opens a discussion, and the report stands, so this turn ends and waits.

- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.
`;

const REPORT = [
  "The work stands here.",
  "",
  "# What the agent needs",
  "",
  "| No. | question | proposed answer |",
  "|---|---|---|",
  "| 1 | which road | the short one |",
].join("\n");
const LINE = "stop: the-owner-asks-to-talk";

function served() {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: JSON.stringify({
      stop: { enabled: true, mostInARow: 3, hold: "off" },
      answer: { enabled: false },
      engine: { binding: "queue" },
    }),
    [at("spec/config/stop/level0.yml")]: RULES,
    [at(TOOLS)]: "{}",
  });
  return boxOf(ROOT, ROOT, {
    disk,
    clock: fakeClock(),
    proc: fakeProc({ "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } }),
    log: fakeLog(),
    index: { warm: () => ({ warmed: false }), dead: () => "" },
  });
}

const stops = (box) =>
  decide({ event: "classic.Stop", e: { last_assistant_message: LINE } }, box);

test("a report the answer before the stop call streams stands, so the line alone ends the turn", async () => {
  const box = served();
  await decide({ event: "turn.said", e: { text: REPORT } }, box);
  const said = await stops(box);
  assert.equal(said?.result?.block, undefined, said?.result?.block);
});

test("a line with no report streamed before it holds the turn", async () => {
  const box = served();
  await decide({ event: "turn.said", e: { text: "The work goes on." } }, box);
  const said = await stops(box);
  assert.match(String(said?.result?.block), /a-report-stands answers false/);
});

test("a helper's streamed report stands for no turn of the session", async () => {
  const box = served();
  await decide({ event: "turn.said", e: { text: REPORT, agentId: "a1" } }, box);
  const said = await stops(box);
  assert.match(String(said?.result?.block), /a-report-stands answers false/);
});
