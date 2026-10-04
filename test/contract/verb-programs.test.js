// Every verb program the folder holds loads over the real doors as a verb of
// the table and hands its words to a run, the vehicle bodies stand beside
// them, and the lens names their folder. A verb with no program runs in Go.
// [[spec/tickets/cli-js-leaves]] [[spec/tickets/landing-verbs-port-to-go]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { PROGRAMS } from "../../src/extension/lib/lens.js";
import { VERBS } from "../../src/scripts/verb-run.js";
import { theStub, theVehicle } from "../../src/scripts/vehicle-verb.js";
import { run as graph } from "../../src/scripts/verbs/graph.js";
import { commands } from "./commands.js";

const FOLDER = join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), ...VERBS);

// A port deletes the program and touches no line of this test. [[spec/tickets/landing-verbs-port-to-go]]
test("every program of the verbs folder loads as a verb of the table answering a run", async () => {
  const listed = new Set(commands().keys());
  const programs = disk()
    .list(FOLDER)
    .filter((one) => one.kind === "file" && one.name.endsWith(".js"));
  assert.ok(programs.length > 0, "the verbs folder holds a program");
  for (const one of programs) {
    const verb = one.name.replace(/\.js$/, "");
    assert.ok(listed.has(verb), `${verb} names no verb of the table`);
    const { run } = await import(pathToFileURL(join(FOLDER, one.name)).href);
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
