// The binding a stop refusal names, over a fake box: the value, the layer that
// sets it, and the moment the server first read it after a change.
// [[spec/design_output/stop#a-refusal-names-the-binding]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { bindingLine } from "../../src/bridge/binding.js";
import * as config from "../../src/bridge/config.js";
import { onStop } from "../../src/bridge/stop.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const FROM = "2026-03-01T10:00:00.000Z";
const LOCAL = ".se/.runtime/config.json";
const TRACKED = "spec/config/level0.json";
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.

- id: done
  side: stop
  priority: 45
  decides: claimed
  asks: Is the work complete?
`;

// A box whose tracked file says unbound, and whose local file says the binding given. [[spec/design_output/stop#a-refusal-names-the-binding]]
function boundBox(local, env = {}) {
  const rows = [];
  const files = {
    [at(TRACKED)]: JSON.stringify({
      stop: { enabled: true, mostInARow: 9, hold: "off" },
      engine: { binding: "unbound" },
    }),
    [at("spec/config/stop/level0.yml")]: RULES,
  };
  if (local) files[at(LOCAL)] = JSON.stringify({ engine: { binding: local } });
  return {
    disk: fakeDisk(files),
    work: ROOT,
    method: ROOT,
    env,
    clock: fakeClock(FROM),
    proc: fakeProc({ "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } }),
    log: { say: (level, area, line) => rows.push({ level, area, line }) },
    rows,
  };
}

const whereFrom = (box, key) => {
  assert.equal(typeof config.whereFrom, "function", "config.js answers whereFrom");
  return config.whereFrom(box, key);
};
const NO_LINE = { last_assistant_message: "Some work stands done." };
const lastLine = (said) => said.result.block.split("\n").at(-1);

// [[spec/design_output/stop#a-refusal-names-the-binding]]
test("whereFrom answers the value and the file that sets it, local over tracked", () => {
  assert.deepEqual(whereFrom(boundBox("queue"), "engine.binding"), {
    value: "queue",
    layer: LOCAL,
  });
  assert.deepEqual(whereFrom(boundBox(""), "engine.binding"), {
    value: "unbound",
    layer: TRACKED,
  });
});

// The hook's asks reads no environment, so whereFrom reads none either. [[spec/design_output/stop#a-refusal-names-the-binding]]
test("whereFrom reads the same layers the hook reads, and skips the environment", () => {
  const box = boundBox("", { SE_ENGINE_BINDING: "god" });
  assert.deepEqual(whereFrom(box, "engine.binding"), {
    value: "unbound",
    layer: TRACKED,
  });
});

// [[spec/design_output/stop#a-refusal-names-the-binding]]
test("a refusal under queue from the local file names queue, the local file and the moment", () => {
  const box = boundBox("queue");
  const said = onStop(NO_LINE, box);
  const line = lastLine(said);
  assert.match(line, /binds to queue/);
  assert.ok(line.includes(LOCAL), line);
  assert.ok(line.includes(FROM), line);
});

// [[spec/design_output/stop#a-refusal-names-the-binding]]
test("the moment stays while the binding stands, and moves when it changes, and the log says the change", () => {
  const box = boundBox("queue");
  onStop(NO_LINE, box);
  box.clock.tick(60_000);
  assert.ok(lastLine(onStop(NO_LINE, box)).includes(FROM), "the binding stands");

  box.disk.write(at(LOCAL), JSON.stringify({ engine: { binding: "god" } }));
  const moved = box.clock.now().toISOString();
  const line = lastLine(onStop(NO_LINE, box));
  assert.match(line, /binds to god/);
  assert.ok(line.includes(moved), line);
  assert.ok(
    box.rows.some((one) => one.area === "binding" && /god/.test(one.line)),
    "the log says the change",
  );
});

// [[spec/design_output/stop#a-refusal-names-the-binding]]
test("bindingLine says no file sets the binding where neither file names it", () => {
  const box = boundBox("");
  box.disk.write(at(TRACKED), JSON.stringify({ stop: { enabled: true } }));
  assert.equal(
    bindingLine(box),
    `No file sets engine.binding for this session, read so at ${FROM}.`,
  );
});
