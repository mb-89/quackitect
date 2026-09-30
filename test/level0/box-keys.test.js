// The server keys a box on its root as `same` folds it, so a drive letter's
// case and a slash's direction reach the box that root already holds.
// [[spec/tickets/box-keys-fold-drive-letters]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { boxesOf } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const doors = () => ({ disk: fakeDisk(), clock: fakeClock() });

test("a C: root and a c: root reach one box", () => {
  const boxes = boxesOf("C:/tree", doors());
  assert.equal(boxes("C:/tree"), boxes("c:/tree"));
  assert.equal(boxes("C:\\tree"), boxes("c:/tree/"));
});

test("two roots on one drive still reach two boxes", () => {
  const boxes = boxesOf("C:/tree", doors());
  assert.notEqual(boxes("C:/tree"), boxes("C:/other"));
});

test("a root with no drive keeps its case", () => {
  const boxes = boxesOf("/tree", doors());
  assert.notEqual(boxes("/tree"), boxes("/Tree"));
});

// [[spec/tickets/readers-name-one-mode-source]]
test("a box holds the mode of each slice, read off the tracked config at the ask", () => {
  const disk = fakeDisk({
    "/tree/spec/config/level0.json": JSON.stringify({
      migration: { prose: "new", log: "old" },
    }),
  });
  const box = boxesOf("/tree", { disk, clock: fakeClock() })("/tree");
  assert.equal(box.slices.prose, "new");
  assert.equal(box.slices.log, "old");
  disk.write(
    "/tree/spec/config/level0.json",
    JSON.stringify({ migration: { prose: "old" } }),
  );
  assert.equal(box.slices.prose, "old", "a change reaches the next ask");
});
