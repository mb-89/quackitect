// THE BOUND THAT TRAVELS WITH AN ACT
// (raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces).
//
// THE RULE DOES NOT CHANGE. Every act writes inside one tree and nowhere else,
// refused at a single resolver. What changes is that WHICH tree is asked
// rather than assumed — so producing a new tree is bounded by the tree being
// produced, and an ordinary walk is bounded by the tree being walked.
//
// THE CONTRADICTION THIS DISSOLVES. Refusing every write outside the tree in
// hand stops the system damaging a neighbour, and stops it producing anything
// at all. Both demands were assumed to name the same tree and never did.
//
// IT LIVES IN ITS OWN MODULE TO KEEP THE IMPORTS ACYCLIC. paths.ts asks it
// whether a bound is open; resolve.ts re-exports the way to open one. If the
// state sat in either of those, the two would import each other.
import { resolve as toAbsolute } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

/** The tree the running act is bounded to, or undefined during a walk.
 *
 *  THIS IS STATE, WHICH IS THE COST OF THE DESIGN AND IS WORTH NAMING OUT
 *  LOUD. A constant cannot be wrong. State can be stale, unset, or set by the
 *  wrong caller, and every one of those is a write landing somewhere nobody
 *  chose (opt-the-bound-travels-with-the-act).
 *
 *  SO THERE IS NO SETTER, deliberately. The only way in is withActBound, which
 *  tears the bound down in a finally — including when the act throws. */
let actBound: string | undefined;

/** Which tree bounds the running act, if any. Read by the jail. */
export function actBoundTree(): string | undefined {
  return actBound;
}

/** Run an act bounded to the tree it is producing.
 *
 *  THE BOUND IS A PROPERTY OF THE ACT, never a mode. It is established by the
 *  act and torn down with it, so an act that opens a bound and fails leaves
 *  nothing bound behind. That is the difference between a guarantee and a
 *  switch somebody forgot. */
export function withActBound<T>(tree: string, source: string, act: () => T): T {
  if (actBound !== undefined) {
    throw new Rejection({
      clause: CLAUSES.OUTSIDE_ACT_BOUND,
      expected: "no act already bounded — one act names one tree",
      got: `a second bound to ${toAbsolute(tree)} while an act is already bounded to ${actBound}`,
      remedy: {
        tool: "se_pull",
        args: {},
        note: "let the running act finish first. A nested bound silently narrows the outer act's guarantee, which is how a write lands in the wrong tree.",
      },
      source,
    });
  }
  actBound = toAbsolute(tree);
  try {
    return act();
  } finally {
    actBound = undefined;
  }
}
