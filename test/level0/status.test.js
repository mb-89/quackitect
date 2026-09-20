// The shape of a full report: the chapters the config names, the block asking
// for them, and what a reply lacks.
// [[spec/design_output/extension#the-ask-is-a-line]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { statusAsks, statusLacks, statusShape } from "../../src/engine/status.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SHAPE =
  "- name: Where it stands\n  says: what the branch holds\n- name: What waits\n  says: what the next hand takes\n";

test("the chapters read off the config the method root holds", () => {
  const disk = fakeDisk({ "/method/spec/config/status.yaml": SHAPE });
  const said = statusShape(disk, "/method");

  assert.deepEqual(
    said.map((one) => one.name),
    ["Where it stands", "What waits"],
  );
  assert.equal(said[0].says, "what the branch holds");
});

test("a tree carrying no shape answers no chapter", () => {
  assert.deepEqual(statusShape(fakeDisk({}), "/method"), []);
});

test("the block asks for every chapter as a heading", () => {
  const said = statusAsks([{ name: "Where it stands", says: "what the branch holds" }]);

  assert.match(said, /mcp__level0__report/);
  assert.match(said, /# Where it stands: what the branch holds/);
});

test("a reply missing a chapter comes back named", () => {
  const chapters = [{ name: "Where it stands" }, { name: "What waits" }];
  const half = "# Where it stands\n\nThe branch holds two tickets.\n";

  assert.match(statusLacks(half, chapters), /What waits/);
  assert.equal(
    statusLacks(`${half}\n# What waits\n\nOne ticket waits.\n`, chapters),
    "",
  );
});
