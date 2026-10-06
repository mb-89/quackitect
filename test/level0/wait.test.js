// The wait tool, on a fake clock: a helper's report, an output's end and a
// quiet file set each return it, and the cap returns it where none comes.
// [[spec/design_output/level0#the-wait-returns-on-signals]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCAL } from "../../.claude/skills/level0/lib/config.js";
import { SPECS, WAIT, WAIT_CALL, waits } from "../../src/bridge/wait.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

test("the wait pauses on the box's clock, and hears a report once the clock moves", { timeout: 1000 }, async () => {
  const work = "/tree";
  const disk = fakeDisk({ [`${work}/${LOCAL}`]: JSON.stringify({ wait: { most: 60, quiet: 1 } }) });
  const box = { clock: fakeClock(), disk, work, method: work, reports: [] };
  const said = waits({ agent: "helper-1" }, box);
  await Promise.resolve();
  box.reports.push("helper-1");
  box.clock.tick(1000);
  assert.deepEqual(await said, { result: { result: "The helper helper-1 reports." } });
});

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
