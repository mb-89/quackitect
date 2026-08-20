// A PLACEHOLDER MAY BE DRAWN. IT MAY NOT BE WALKED INTO.
//
// The pin scaffolds every seeded sub-machine so the machine view can draw a
// route through work nobody has authored yet. That scaffold compiled to a bare
// start-to-end pill, and the walk went straight through it: i3 passed
// specify-build, seeded nothing, and build-steps reported itself done. A whole
// build was skipped in silence on 2026-08-13.
//
// Refusing at COMPILE time is the wrong seam — drawnsub.test.ts pins that the
// placeholder must resolve, or the view cannot draw. So the decl is MARKED
// here, and the walk refuses to enter a marked one.
import { strict as assert } from "node:assert";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { itSeededRel, SCAFFOLD_NONE } from "../engine/iterations.ts";
import { generateSeeded } from "../engine/iterations-draw.ts";
import { freshRoot } from "./helpers.ts";

const ID = "i99-scaffold-entry";

/** An iteration-shaped stub — generateSeeded reads only its id and its path. */
function at(root: string, drawing: string): { id: string; path: string } {
  const abs = join(root, itSeededRel(ID, "build-chunks"));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, drawing, "utf8");
  return { id: ID, path: root };
}

// THE PLACEHOLDER STILL RESOLVES. This half is what stopped the obvious fix:
// the view has to draw a route through a machine nobody has authored, so
// throwing here breaks the drawing rather than the skip.
test("the pin's placeholder compiles, and comes back MARKED as a scaffold", () => {
  const root = freshRoot();
  const it = at(root, `---\nnone: "${SCAFFOLD_NONE}"\n---\n`);
  const gen = generateSeeded(root, it as never, "build-chunks", "build-chunks");
  assert.equal(gen.decl.scaffold, true, "the walk must be able to tell a placeholder from an authored none");
  assert.ok(gen.decl.states.length > 0, "and it still resolves — the view draws a route through it");
});

// THE OTHER HALF, and the one that keeps the guard honest. Zero steps IS a
// legal outcome when the drawing says why, and that case must walk through
// untouched.
test("an authored none is NOT a scaffold and stays walkable", () => {
  const root = freshRoot();
  const it = at(root, '---\nnone: "no chunks — the change is one line in an existing file"\n---\n');
  const gen = generateSeeded(root, it as never, "build-chunks", "build-chunks");
  assert.equal(gen.decl.scaffold, undefined, "an explicit none is a decision, not an absence");
});

// ONE CONSTANT, TWO ENDS. The pin writes the placeholder and the compiler reads
// it back. Two copies of the literal would drift apart silently, and the guard
// would stop firing without any test going red.
test("the pin writes the same literal the compiler recognises", () => {
  const src = readFileSync(join(import.meta.dirname, "..", "engine", "iterations.ts"), "utf8");
  const copies = src.split("not authored yet - the authoring state").length - 1;
  assert.equal(copies, 1, `the placeholder literal is written ${copies} times — it must live in SCAFFOLD_NONE alone`);
});

// WHAT THIS FILE DOES NOT PROVE: that the walk refuses. That happens in
// session.ts seedSubs, and reaching it needs a full walk down to a run state.
// This asserts the refusal SHIPS, in the manner reopen.test.ts uses for the
// recheck block. It is inspection, not a walk, and it is named as such.
test("the entry refusal ships, and says what to do about it", () => {
  const src = readFileSync(join(import.meta.dirname, "..", "engine", "session.ts"), "utf8");
  const at = src.indexOf("decl.scaffold === true");
  assert.ok(at > 0, "seedSubs carries the scaffold guard");
  const block = src.slice(at, at + 900);
  assert.match(block, /Rejection/, "it refuses rather than warning");
  assert.match(block, /state that seeds/, "and the remedy names where to go");
});
