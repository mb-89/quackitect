// The bridge code loads: the server and every module it imports, and one of
// each event through decide. The check refuses a tree whose bridge falls on
// its first event, before any server steps down for it.
// [[spec/design_output/level0#new-code-proves-it-loads]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { SELF_TEST } from "../../src/bridge/reload.js";
import { selfTests } from "../../src/bridge/selftest.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { proc } from "../../src/doors/proc.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("every module the server imports loads, and one of each event passes decide", async () => {
  const said = [];
  assert.equal(
    await selfTests(ROOT, { boxOf, decide }, (line) => said.push(line)),
    0,
    said.join("\n"),
  );
});

test("the flag the running server spawns exits 0 over this tree", () => {
  const ran = proc().run(
    [process.execPath, join(ROOT, "src", "bridge", "server.js"), SELF_TEST, ROOT],
    {
      cwd: ROOT,
      timeoutMs: 60000,
    },
  );
  assert.equal(ran.exitCode, 0, ran.stderr);
});

test("a decide that throws exits 1 and names the event", async () => {
  const said = [];
  const broken = {
    boxOf,
    decide: async () => {
      throw new ReferenceError("dropsMoved is not defined");
    },
  };
  assert.equal(await selfTests(ROOT, broken, (line) => said.push(line)), 1);
  assert.match(said[0], /session\.start.*ReferenceError: dropsMoved is not defined/s);
});
