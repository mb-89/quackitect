// Every verb program loads over the real doors and hands its words to a run,
// the vehicle bodies stand beside them, and the lens names their folder. A
// verb running in Go carries no program.
// [[spec/tickets/cli-js-leaves]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { PROGRAMS } from "../../src/extension/lib/lens.js";
import { VERBS } from "../../src/scripts/verb-run.js";
import { theStub, theVehicle } from "../../src/scripts/vehicle-verb.js";
import { run as check } from "../../src/scripts/verbs/check.js";
import { run as commit } from "../../src/scripts/verbs/commit.js";
import { run as config } from "../../src/scripts/verbs/config.js";
import { run as doctor } from "../../src/scripts/verbs/doctor.js";
import { run as doors } from "../../src/scripts/verbs/doors.js";
import { run as fix } from "../../src/scripts/verbs/fix.js";
import { run as graph } from "../../src/scripts/verbs/graph.js";
import { run as mint } from "../../src/scripts/verbs/mint.js";
import { run as probe } from "../../src/scripts/verbs/probe.js";
import { run as project } from "../../src/scripts/verbs/project.js";
import { run as push } from "../../src/scripts/verbs/push.js";
import { run as rename } from "../../src/scripts/verbs/rename.js";
import { run as retro } from "../../src/scripts/verbs/retro.js";
import { run as rules } from "../../src/scripts/verbs/rules.js";
import { run as serve } from "../../src/scripts/verbs/serve.js";
import { run as setup } from "../../src/scripts/verbs/setup.js";
import { run as split } from "../../src/scripts/verbs/split.js";
import { run as standing } from "../../src/scripts/verbs/standing.js";
import { run as stub } from "../../src/scripts/verbs/stub.js";
import { run as testVerb } from "../../src/scripts/verbs/test.js";
import { run as ticket } from "../../src/scripts/verbs/ticket.js";
import { run as tools } from "../../src/scripts/verbs/tools.js";
import { run as tui } from "../../src/scripts/verbs/tui.js";
import { run as vehicle } from "../../src/scripts/verbs/vehicle.js";
import { run as voice } from "../../src/scripts/verbs/voice.js";
import { commands } from "./commands.js";

const RUNS = {
  check,
  commit,
  config,
  doctor,
  doors,
  fix,
  graph,
  mint,
  probe,
  project,
  push,
  rename,
  retro,
  rules,
  serve,
  setup,
  split,
  standing,
  stub,
  test: testVerb,
  ticket,
  tools,
  tui,
  vehicle,
  voice,
};

// The folder the programs stand in. [[spec/tickets/read-verbs-port-to-go]]
const VERB_FOLDER = join(
  dirname(dirname(dirname(fileURLToPath(import.meta.url)))),
  "src",
  "scripts",
  "verbs",
);

test("every verb of the table loads as a program answering a run", () => {
  const listed = [...commands().keys()]
    .filter((verb) => disk().exists(join(VERB_FOLDER, `${verb}.js`)))
    .sort();
  assert.deepEqual(Object.keys(RUNS).sort(), listed);
  for (const [verb, run] of Object.entries(RUNS)) {
    assert.equal(typeof run, "function", `${verb} runs`);
  }
});

test("the vehicle bodies stand beside the programs", () => {
  assert.equal(typeof theVehicle, "function");
  assert.equal(typeof theStub, "function");
});

test("the lens names the folder the runner owns", () => {
  assert.equal(PROGRAMS, VERBS.join("/"));
});

// A graph with no path refuses with its usage, before any read. [[spec/tickets/cli-js-leaves]]
test("the graph program refuses a call naming no path", async () => {
  const was = console.error;
  console.error = () => {};
  try {
    assert.equal(await graph([]), 2);
  } finally {
    console.error = was;
  }
});
