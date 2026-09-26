// The doors the commit verb runs over carry the environment, so the verb reads
// the box it runs on and a desk pushes nothing.
// [[spec/guidance/working]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { PANEL, PORT_WAIT } from "../../src/scripts/cli-served.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const source = disk().read(join(root, "src", "scripts", "cli-check.js"));

// [[spec/guidance/working]]
test("the commit verb's doors carry the environment", () => {
  const doors = /export function commitDoors\(\)[\s\S]*?\n}\n/.exec(source)?.[0] ?? "";
  assert.match(doors, /env: process\.env/, "the verb reads the box it runs on");
});

// One place owns the server's list, and the check's module reads it from there. [[spec/design_output/lsp#a-port-serves-the-list]]
test("the server's list stands in cli-served alone", () => {
  assert.doesNotMatch(source, /function serverFaults\(/, "the check holds no copy");
  const served = disk().read(join(root, "src", "scripts", "cli-served.js"));
  assert.match(served, /export async function serverFaults\(/);
});

// A Go module exports nothing to JavaScript, so the copies in cli-served meet their owners in port.go here. [[spec/tickets/each-fact-keeps-one-owner]]
test("the panel pointer and the port wait match pointerPath and settleWait in port.go", () => {
  const port = disk().read(join(root, "src", "lsp", "port.go"));
  const joined = /func pointerPath\(root string\) string \{\s*return filepath\.Join\(root, ([^)]*)\)/.exec(port);
  assert.ok(joined, "pointerPath joins its segments onto the root");
  const segments = [...joined[1].matchAll(/"([^"]+)"/g)].map((one) => one[1]);
  assert.equal(segments.join("/"), PANEL, "PANEL spells the path pointerPath writes");
  const wait = /settleWait\s*=\s*(\d+)\s*\*\s*time\.(Minute|Second)/.exec(port);
  assert.ok(wait, "settleWait reads as a count of minutes or seconds");
  const unit = { Minute: 60_000, Second: 1_000 }[wait[2]];
  assert.equal(Number(wait[1]) * unit, PORT_WAIT, "PORT_WAIT waits as long as settleWait");
});

// The cloud read and the ticket folders each stand in one module, and the readers import them. [[spec/tickets/each-fact-keeps-one-owner]]
test("every reader of the cloud asks cloudHere, and named.js builds no folder list of its own", () => {
  for (const path of [
    ["src", "scripts", "pull-push.js"],
    ["src", "bridge", "stop.js"],
  ]) {
    const text = disk().read(join(root, ...path));
    assert.doesNotMatch(text, /\binCloud\b/, `${path.join("/")} reads the environment itself`);
    assert.match(text, /\bcloudHere\(/, `${path.join("/")} asks cloudHere`);
  }
  const named = disk().read(join(root, "src", "engine", "named.js"));
  assert.doesNotMatch(named, /const WHERE =/, "named.js builds no folder list of its own");
});

// The hook loads the plugin alone, so a module it imports reaches no file past the plugin's folder. [[spec/tickets/each-fact-keeps-one-owner]]
test("apply.js imports its siblings alone", () => {
  const text = disk().read(join(root, ".claude", "skills", "level0", "lib", "apply.js"));
  for (const one of text.matchAll(/from\s+"([^"]+)"/g)) {
    assert.match(one[1], /^\.\/[^/]+\.js$/, `${one[1]} stands past the plugin's lib folder`);
  }
});
