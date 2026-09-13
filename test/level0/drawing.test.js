// The editor's reader of the graph, over a fake door. It reads the file and
// hands it to the emitter beside the verbs, so every case here asserts that one
// reader stands and no second copy of the drawing does.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { drawable, EMITTER, graphAt } from "../../src/extension/lib/drawing.js";
import * as emitter from "../../src/scripts/graph.js";

const ROUTE = "steps:\n  - name: do\n    does: makes it\n    to: retro\n";

function doorWith(files = {}) {
  const asked = [];
  return {
    asked,
    read: async (path) => files[path] ?? "",
    imports: async (path) => {
      asked.push(path);
      return emitter;
    },
  };
}

test("a process file and a ticket draw, and nothing else does", () => {
  assert.equal(drawable("spec/processes/standard.yaml"), "process");
  assert.equal(drawable("spec/tickets/a-ticket.md"), "ticket");
  assert.equal(drawable(".se/tickets/slow-lint.md"), "ticket");
  assert.equal(drawable("spec/guidance/working.md"), "");
  assert.equal(drawable("spec/processes/README.md"), "");
  assert.equal(drawable(""), "");
});

test("a windows path reads the same as a path with slashes", () => {
  assert.equal(drawable("spec\\processes\\standard.yaml"), "process");
});

test("the editor reads the graph off the emitter beside the verbs", async () => {
  const door = doorWith({ "spec/processes/standard.yaml": ROUTE });
  const said = await graphAt(door, "spec/processes/standard.yaml");

  assert.deepEqual(door.asked, [EMITTER]);
  assert.deepEqual(
    said,
    emitter.graphOf({ steps: [{ name: "do", does: "makes it", to: "retro" }] }),
  );
});

test("a file outside the two folders reaches the emitter never", async () => {
  const door = doorWith({ "spec/guidance/working.md": "# A note\n" });
  assert.equal(await graphAt(door, "spec/guidance/working.md"), null);
  assert.deepEqual(door.asked, []);
});

test("a file standing empty draws nothing, and the emitter stays unasked", async () => {
  const door = doorWith({});
  assert.equal(await graphAt(door, "spec/processes/standard.yaml"), null);
  assert.deepEqual(door.asked, []);
});
