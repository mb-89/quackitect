// The wait tool, on a fake clock: a helper's report, an output's end and a
// quiet file set each return it, and the cap returns it where none comes.
// [[spec/design_output/level0#the-wait-returns-on-signals]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TOOLS as SURVEY } from "../../.claude/skills/level0/lib/tools.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { helperReports, SPECS, WAIT, WAIT_CALL, waits } from "../../src/bridge/wait.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const CONFIG = { wait: { most: 60, quiet: 5 } };
const OUT = "out/run.txt";
const STEP = 1000;

function served() {
  const clock = fakeClock();
  return boxOf(ROOT, ROOT, {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify(CONFIG),
      [at(SURVEY)]: "{}",
      [at(OUT)]: "one\n",
      [at("a.txt")]: "a",
      [at("b.txt")]: "b",
    }),
    clock,
    proc: fakeProc({}),
    log: fakeLog(clock),
    index: { warm: () => ({ warmed: false }), dead: () => "" },
  });
}

// A pause that moves the fake clock, and runs what a case asks at a tick. [[spec/design_output/level0#the-wait-returns-on-signals]]
function pausing(box, at = {}) {
  let ticks = 0;
  return async (ms) => {
    box.clock.tick(ms);
    ticks += 1;
    at[ticks]?.();
  };
}

const said = (answer) => String(answer?.result?.result ?? "");
const spent = (box, from) => (box.clock.now().getTime() - from) / STEP;

test("the spec names the wait and the three signals it takes", () => {
  const [spec] = SPECS();
  assert.equal(spec.name, WAIT);
  assert.equal(WAIT_CALL, "mcp__level0__wait");
  assert.deepEqual(Object.keys(spec.inputSchema.properties), [
    "agent",
    "output",
    "pid",
    "files",
  ]);
});

// [[spec/design_output/level0#the-wait-returns-on-signals]]
test("a helper's report returns the wait, and writes a report row to the log", async () => {
  const box = served();
  const pause = pausing(box, { 3: () => helperReports({ agentId: "a1" }, box) });

  const answer = await waits({ agent: "a1" }, box, pause);

  assert.match(said(answer), /^The helper a1 reports\./);
  const rows = box.log.lines().filter((one) => one.kind === "report");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].agentId, "a1");
});

// [[spec/design_output/level0#the-wait-returns-on-signals]]
test("an output's process ending returns the wait", async () => {
  const box = served();
  box.proc.lives.add(42);
  const pause = pausing(box, {
    1: () => box.disk.write(at(OUT), "one\ntwo\n"),
    2: () => box.proc.lives.delete(42),
  });

  const answer = await waits({ output: OUT, pid: 42 }, box, pause);

  assert.match(
    said(answer),
    /^The output out\/run\.txt ends, because its process exits\./,
  );
});

// [[spec/design_output/level0#the-wait-returns-on-signals]]
test("an output growing holds the wait, and one standing quiet past the span returns it", async () => {
  const box = served();
  const from = box.clock.now().getTime();
  const grows = () => box.disk.write(at(OUT), `${box.disk.read(at(OUT))}more\n`);
  const pause = pausing(box, { 1: grows, 2: grows, 3: grows });

  const answer = await waits({ output: OUT }, box, pause);

  assert.match(said(answer), /^The output out\/run\.txt stands quiet for 5s\./);
  assert.equal(spent(box, from), 3 + 5, "the quiet span counts from the last growth");
});

// [[spec/design_output/level0#the-wait-returns-on-signals]]
test("a file set standing quiet past the span returns the wait, and a write to one holds it", async () => {
  const box = served();
  const from = box.clock.now().getTime();
  const pause = pausing(box, { 2: () => box.disk.write(at("b.txt"), "bb") });

  const answer = await waits({ files: ["a.txt", "b.txt"] }, box, pause);

  assert.match(said(answer), /^The files a\.txt, b\.txt stand quiet for 5s\./);
  assert.equal(spent(box, from), 2 + 5);
});

// [[spec/design_output/level0#the-wait-returns-on-signals]]
test("the cap returns the wait where no signal comes", async () => {
  const box = served();
  const from = box.clock.now().getTime();

  const answer = await waits({ agent: "a9" }, box, pausing(box));

  assert.match(said(answer), /^The wait reaches its cap of 60s, and no signal comes\./);
  assert.equal(spent(box, from), 60);
});

// [[spec/design_output/level0#the-wait-returns-on-signals]]
test("a wait naming no signal answers what it takes", async () => {
  const box = served();
  assert.match(
    said(await waits({}, box, pausing(box))),
    /takes an agent, an output or files/,
  );
});

// The server registers the wait, and a helper's stop reaches it as a report. [[spec/design_output/level0#the-wait-returns-on-signals]]
test("the server registers the wait, and a helper's stop writes its report", async () => {
  const box = served();
  const first = await decide({ event: "tool.call", e: { tool: "Read" } }, box);
  assert.ok(
    (first.register ?? []).some((one) => one.name === WAIT),
    "the wait registers",
  );

  const stopped = await decide({ event: "classic.Stop", e: { agentId: "a2" } }, box);
  assert.deepEqual(stopped, { pass: true });
  const rows = box.log.lines().filter((one) => one.kind === "report");
  assert.deepEqual(
    rows.map((one) => one.agentId),
    ["a2"],
  );
});
