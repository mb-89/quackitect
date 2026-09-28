// The serve verb on a desk: without the debugger it starts the server
// detached and returns, and its exit code says whether the server stands.
// [[spec/design_output/level0#a-desk-serve-returns]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { serveBridge } from "../../src/scripts/cli.js";
import { probeOf } from "../../src/scripts/serve.js";

const ROOT = "/tree";
const SERVER_AT = join(ROOT, "src", "bridge", "server.js");

function doors(probe, start) {
  const proc = fakeProc({
    [probeOf("node", 6510).join(" ")]: { exitCode: probe },
    [["node", SERVER_AT, ROOT].join(" ")]: start,
  });
  return { proc, disk: fakeDisk(), env: {}, root: ROOT, join, node: "node" };
}

async function heard(what) {
  const lines = [];
  const was = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  try {
    return { code: await what(), said: lines.join("\n") };
  } finally {
    console.log = was;
  }
}

// [[spec/design_output/level0#a-desk-serve-returns]]
test("the serve verb starts a detached server, exits zero, and says the port", async () => {
  const { code, said } = await heard(() => serveBridge([], doors(1, { stands: true })));
  assert.equal(code, 0);
  assert.match(said, /starts detached at port 6510/);
});

// [[spec/design_output/level0#a-desk-serve-returns]]
test("the serve verb exits one where the start falls", async () => {
  const { code, said } = await heard(() => serveBridge([], doors(1, { exitCode: 1 })));
  assert.equal(code, 1);
  assert.match(said, /falls:/);
});
