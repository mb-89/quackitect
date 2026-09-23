// The caches a box holds over files, each dropped where a tool run moves its
// file, and every one dropped at a session start.
// [[spec/design_output/level0#a-cache-follows-its-file]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { dropsAll, dropsMoved } from "../../src/bridge/caches.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const AFTER = "classic.PostToolUse";

function held() {
  const disk = fakeDisk({
    [at("spec/schemas/paragraph.schema.yaml")]: "layers: {}\n",
    [at("spec/vocabulary/terms.yml")]: "- {word: one}\n",
    [at("spec/config/stop/level0.yml")]: "- id: one\n",
    [at("spec/schemas/ticket.schema.yaml")]: "kind: ticket\n",
  });
  return {
    disk,
    method: ROOT,
    words: new Set(["one"]),
    paragraphSchema: { layers: {} },
    stopRules: [{ id: "one" }],
    schemas: new Map(),
  };
}

test("a tool run moving the terms drops the words alone", () => {
  const box = held();
  dropsMoved(box, "session.start");
  box.disk.write(at("spec/vocabulary/terms.yml"), "- {word: two}\n");
  assert.deepEqual(dropsMoved(box, AFTER), ["words"]);
  assert.equal(box.words, undefined);
  assert.ok(box.stopRules, "the stop rules stand");
});

test("a write under the schemas drops the note schemas, and a stop rule drops the rules", () => {
  const box = held();
  dropsMoved(box, "session.start");
  box.disk.write(at("spec/schemas/ticket.schema.yaml"), "kind: ticket\nmore: yes\n");
  box.disk.write(at("spec/config/stop/level0.yml"), "- id: two\n");
  assert.deepEqual(dropsMoved(box, AFTER).sort(), ["schemas", "stopRules"]);
});

test("a call before the tool run reads nothing, and a session start drops every cache", () => {
  const box = held();
  dropsMoved(box, "session.start");
  box.disk.write(at("spec/config/stop/level0.yml"), "- id: two\n");
  assert.deepEqual(dropsMoved(box, "tool.call"), []);
  dropsAll(box);
  assert.deepEqual(
    [box.words, box.paragraphSchema, box.stopRules, box.schemas],
    [undefined, undefined, undefined, undefined],
  );
});
