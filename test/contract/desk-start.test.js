// A server the proc door starts detached outlives the process that starts it,
// the way the editor and the shell start one on a desk.
// [[spec/tickets/the-bridge-outlives-its-starter]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const files = disk();
const MARKER = "started.txt";
const WAITS = 60;
const LATE = 1500;
const WINDOW = 200;
// The stub writes its marker past its starter's exit, so a marker proves it outlived the start.
const SERVER = `setTimeout(() => require("fs").writeFileSync(process.argv[2] + "/${MARKER}", "up"), ${LATE});\n`;
const DOOR = pathToFileURL(
  join(import.meta.dirname, "..", "..", "src", "doors", "proc.js"),
).href;

const nodeHere = () =>
  proc().run(["node", "-e", "process.exit(0)"], { timeoutMs: 5000 }).exitCode === 0;

function pause(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitsFor(at) {
  for (let step = 0; step < WAITS; step++) {
    if (files.exists(at)) return true;
    pause(100);
  }
  return files.exists(at);
}

// Windows answers EPERM to a remove under a live process, so the retry gives the stub the moment it takes to exit. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
function gone(where) {
  for (let step = 0; step < WAITS; step++) {
    try {
      files.remove(where);
      return;
    } catch {
      pause(100);
    }
  }
}

test("a server the proc door starts detached writes its marker after its starter exits", {
  skip: nodeHere() ? false : "this box carries no node on the PATH",
}, () => {
  const where = files.tempDir("level0-desk-start-");
  try {
    const stub = join(where, "server.js");
    files.write(stub, SERVER);
    const starts = `import(${JSON.stringify(DOOR)}).then(({ proc }) => proc().respawn([process.execPath, ${JSON.stringify(stub)}, ${JSON.stringify(where)}], { cwd: ${JSON.stringify(where)}, out: ${JSON.stringify(join(where, "serve.log"))}, waitMs: ${WINDOW} })).then((born) => process.exit(born.fell ? 1 : 0))`;
    const said = proc().run(["node", "-e", starts], { timeoutMs: 30_000 });
    assert.equal(
      said.exitCode,
      0,
      `the starter stands the server and exits: ${said.stderr}`,
    );
    assert.equal(
      files.exists(join(where, MARKER)),
      false,
      "the marker waits past the starter",
    );
    assert.equal(
      waitsFor(join(where, MARKER)),
      true,
      "the server outlives its starter",
    );
  } finally {
    gone(where);
  }
});
