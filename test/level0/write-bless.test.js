// The write door over the bless file: an agent writes it nowhere, because the
// sidebar button is the one hand that writes it.
// [[spec/design_output/pull#the-bless]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { onWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { TICKET_SCHEMA as SCHEMA } from "./fixtures.js";

const METHOD = "/tools";
const WORK = "/stub";
const BLESS_FILE = join(WORK, ".se", ".runtime", "bless.json");

// The box the server keeps per work root, with the doors this test needs. [[spec/design_output/level0#the-bridgehead-and-the-server]]
function box(files = {}) {
  return {
    method: METHOD,
    work: WORK,
    root: WORK,
    disk: fakeDisk({
      [join(METHOD, "spec", "schemas", "ticket.schema.yaml")]: SCHEMA,
      ...files,
    }),
    log: fakeLog(),
    vale: { stands: () => false },
    biome: { stands: () => false },
    projections: [],
  };
}

const denied = (said) => String(said?.result?.deny ?? "");

// [[spec/design_output/pull#the-bless]]
test("the write door refuses an agent's write to the bless file", async () => {
  const said = await onWrite(
    { tool: "Write", file_path: BLESS_FILE, content: '{"agent": true}\n' },
    box(),
  );
  assert.match(denied(said), /bless\.json/, "the refusal names the file");
});

// [[spec/design_output/pull#the-bless]]
test("the write door refuses an agent's edit to a standing bless file", async () => {
  const said = await onWrite(
    {
      tool: "Edit",
      file_path: BLESS_FILE,
      old_string: '"agent": false',
      new_string: '"agent": true',
    },
    box({ [BLESS_FILE]: '{"agent": false}\n' }),
  );
  assert.match(denied(said), /bless\.json/);
});

// [[spec/design_output/pull#the-bless]]
test("a write to another runtime file lands", async () => {
  const said = await onWrite(
    {
      tool: "Write",
      file_path: join(WORK, ".se", ".runtime", "other.json"),
      content: "{}\n",
    },
    box(),
  );
  assert.equal(denied(said), "");
});

// [[spec/design_output/pull#the-bless]]
test("the write door's refusal names the sidebar button as the hand writing the bless file", async () => {
  const said = await onWrite(
    { tool: "Write", file_path: BLESS_FILE, content: '{"agent": false}\n' },
    box(),
  );
  assert.match(denied(said), /sidebar button/);
});
