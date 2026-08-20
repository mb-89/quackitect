// AN EMPTY LIVE SOURCE SAYS SO — req-an-empty-live-source-names-itself.
//
// WHAT THIS FILE IS FOR. A `$name` NOBODY RESOLVES already throws, which is the
// typo case. The dangerous one is the source that resolves CORRECTLY and
// returns nothing: the field renders as a plain control with no offer, which
// reads exactly like a field somebody forgot to wire up.
//
// TWO LEGS, BOTH ASSERTED. A payload that carries the fact and a surface that
// draws it are two different things, and a fix with only the first looks done.
// The same silence runs wider — a matrix over no functions draws an empty grid,
// a comparison over an empty pool reports every pair settled. This file governs
// the FORM FIELD, which is where the rule was first written down.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { FORM } from "../engine/renderclient-form.ts";
import { fieldArgsFor } from "../engine/stateform.ts";
import { freshRoot } from "./helpers.ts";

/** A root whose trace holds nothing at all, so every live source is empty. */
function emptyTrace(): { root: string; traceRoot: string } {
  const root = freshRoot();
  return { root, traceRoot: `${root}/spec/trace` };
}

test("a live source that resolves to nothing is named on the field", () => {
  const { root, traceRoot } = emptyTrace();
  const args = fieldArgsFor(
    { name: "probes", template: "node-table", of: "raid", items: ["$assumptions"], columns: ["probe"] } as never,
    root,
    traceRoot,
  );
  assert.deepEqual(args.items, [], "the premise: this source really does resolve to nothing here");
  assert.deepEqual(
    args.empty_sources,
    ["$assumptions"],
    "the field says WHICH live source came back empty, so an unwired field and an empty one read differently",
  );
});

test("a source with items names nothing, because there is nothing to explain", () => {
  const { root, traceRoot } = emptyTrace();
  const args = fieldArgsFor({ name: "picked", template: "list", items: ["a literal item"] } as never, root, traceRoot);
  assert.deepEqual(args.items, ["a literal item"]);
  assert.deepEqual(args.empty_sources, [], "a literal is not a live source and an answered source is not empty");
});

test("a field declaring no items at all is not an empty source", () => {
  const { root, traceRoot } = emptyTrace();
  const args = fieldArgsFor({ name: "prose", template: "free-form" } as never, root, traceRoot);
  assert.deepEqual(args.empty_sources, [], "silence about a source nobody declared is correct silence");
});

// THE SECOND LEG. A payload carrying the fact and a surface drawing it are two
// different things, and the row's measure counts a RENDERED line — so a green
// on the three cases above with nothing on screen would be the fix looking done.
test("the field's own surface draws a line naming the empty source", () => {
  assert.ok(FORM.includes("args.empty_sources"), "the form script reads the field's empty sources rather than ignoring them");
  assert.ok(
    FORM.includes("the live source "),
    "and it draws a line naming the source, in the field, where an empty control would otherwise sit",
  );
});
