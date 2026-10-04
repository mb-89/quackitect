// Every verb program loads over the real doors and hands its words to a run,
// the vehicle bodies stand beside them, and the lens names their folder.
// [[spec/tickets/cli-js-leaves]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { PROGRAMS } from "../../src/extension/lib/lens.js";
import { VERBS } from "../../src/scripts/verb-run.js";
import { run as branch } from "../../src/scripts/verbs/branch.js";
import { run as check } from "../../src/scripts/verbs/check.js";
import { run as cloud } from "../../src/scripts/verbs/cloud.js";
import { run as commit } from "../../src/scripts/verbs/commit.js";
import { run as config } from "../../src/scripts/verbs/config.js";
import { run as dispatch } from "../../src/scripts/verbs/dispatch.js";
import { run as doctor } from "../../src/scripts/verbs/doctor.js";
import { run as doors } from "../../src/scripts/verbs/doors.js";
import { run as find } from "../../src/scripts/verbs/find.js";
import { run as fix } from "../../src/scripts/verbs/fix.js";
import { run as graph } from "../../src/scripts/verbs/graph.js";
import { run as index } from "../../src/scripts/verbs/index.js";
import { run as links } from "../../src/scripts/verbs/links.js";
import { run as lint } from "../../src/scripts/verbs/lint.js";
import { run as log } from "../../src/scripts/verbs/log.js";
import { run as mint } from "../../src/scripts/verbs/mint.js";
import { run as notes } from "../../src/scripts/verbs/notes.js";
import { run as probe } from "../../src/scripts/verbs/probe.js";
import { run as project } from "../../src/scripts/verbs/project.js";
import { run as push } from "../../src/scripts/verbs/push.js";
import { run as rename } from "../../src/scripts/verbs/rename.js";
import { run as retro } from "../../src/scripts/verbs/retro.js";
import { run as rules } from "../../src/scripts/verbs/rules.js";
import { run as setup } from "../../src/scripts/verbs/setup.js";
import { run as split } from "../../src/scripts/verbs/split.js";
import { run as standing } from "../../src/scripts/verbs/standing.js";
import { run as testVerb } from "../../src/scripts/verbs/test.js";
import { run as ticket } from "../../src/scripts/verbs/ticket.js";
import { run as tools } from "../../src/scripts/verbs/tools.js";
import { commands, goVerbs } from "./commands.js";

const RUNS = {
  branch,
  check,
  cloud,
  commit,
  config,
  dispatch,
  doctor,
  doors,
  find,
  fix,
  graph,
  index,
  links,
  lint,
  log,
  mint,
  notes,
  probe,
  project,
  push,
  rename,
  retro,
  rules,
  setup,
  split,
  standing,
  test: testVerb,
  ticket,
  tools,
};

test("every verb of the table Go answers in part loads as a program answering a run", () => {
  const whole = goVerbs();
  const listed = [...commands().keys()].filter((one) => !whole.has(one)).sort();
  assert.deepEqual(Object.keys(RUNS).sort(), listed);
  for (const [verb, run] of Object.entries(RUNS)) {
    assert.equal(typeof run, "function", `${verb} runs`);
  }
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
