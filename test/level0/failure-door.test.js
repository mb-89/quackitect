// The failure door prints the message, the id at its level and each remedy,
// and logs a row carrying the id.
// [[spec/design_output/failures#one-door-raises-a-failure]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeFailure } from "../../src/doors/fake/failure.js";

const HELD = { id: "leaf-held", level: "warn", remedies: ["Pull again.", "Hand the leaf back first."] };

test("raise prints the message, the id at its level and each remedy off the fake, and logs a row carrying the id", async () => {
  const door = fakeFailure([HELD]);
  const lines = await door.raise("leaf-held", "a leaf stands in your hand");
  assert.deepEqual(lines, [
    "a leaf stands in your hand",
    "failure leaf-held at warn",
    "remedy: Pull again.",
    "remedy: Hand the leaf back first.",
  ]);
  assert.deepEqual(door.raised(), ["leaf-held"]);
  const [row] = door.log.lines();
  assert.equal(row.kind, "failure");
  assert.equal(row.level, "warn");
  assert.equal(row.said, "a leaf stands in your hand");
  assert.equal(row.failure, "leaf-held");
});

test("raise names an unregistered id and prints its message", async () => {
  const lines = await fakeFailure().raise("nobody", "it fails");
  assert.deepEqual(lines, [
    "it fails",
    "failure nobody stands unregistered, so spec/failures names no remedy",
  ]);
});

test("an unregistered id writes a row at error carrying the id", async () => {
  const door = fakeFailure();
  await door.raise("nobody", "it fails");
  const [row] = door.log.lines();
  assert.equal(row.level, "error");
  assert.equal(row.failure, "nobody");
});

test("raise takes a message of several lines, as the Go door does", async () => {
  const door = fakeFailure([HELD]);
  const lines = await door.raise("leaf-held", "a leaf stands", "in your hand");
  assert.deepEqual(lines.slice(0, 2), ["a leaf stands", "in your hand"]);
  assert.equal(door.log.lines()[0].said, "a leaf stands in your hand");
});
