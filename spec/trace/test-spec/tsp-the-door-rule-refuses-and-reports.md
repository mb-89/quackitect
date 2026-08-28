---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: tsp-the-door-rule-refuses-and-reports
type: "[[test-spec]]"
statement: The door rule refuses an undeclared reach at write time, refuses a departure with no reason, and enumerates entry points from the source rather than from a list.
method: test
verifies:
  - req-the-reachability-guard-enumerates-exports-from-the-source
  - req-an-exemption-without-a-reason-is-refused-at-write-time
  - req-absence-from-the-exemption-list-means-not-exempt
files:
  - tests/doors.test.ts
---

## Scope

The three demands that can be MEASURED under controlled conditions.

- The entry-point enumeration comes from the source tree, so adding an entry point cannot go unnoticed.
- A write that adds a departure with no reason is refused, and the refusal names the file, the line and what is missing.
- A module absent from a departure list is governed, never quietly allowed.

### What is deliberately out

The three static attributes of the regime — no blanket off-switch, one rule read by two callers, and a door named for its conversation. Those are examined rather than run, and they live on `tsp-the-door-regime-s-static-attributes`.

The sweep's runtime is also out. It is measured at `exp-where-does-the-sweep-s-runtime-actually-go` and is not a pass criterion here.

## Approach

COMPONENT LEVEL, against the rule module directly. Every case that can sit below the lane sits below it, because a defect catchable at component level costs a fraction of one caught at system level.

The design methods, chosen from the shape of each demand.

- EQUIVALENCE CLASSES for the departure list. A line is one of four: a path with a reason, a path with no reason, a path with an empty reason, or not a path at all. One case per class.
- BOUNDARY VALUES on the reason. The boundary between refused and accepted is the shortest non-empty reason, so the cases sit either side of it.
- FAULT-BASED for the enumeration. The fault this record exists to fix is an entry point nobody added to a list, so the case injects one and demands it is named.
- A NEGATIVE CASE PER GUARD. A guard that never refuses passes every positive case, which is the silent pass the widget round already learned once.

Risk decides the depth. `req-an-exemption-without-a-reason-is-refused-at-write-time` is the record's whole differentiator and is graded crippling, so it carries the most cases. The enumeration is graded crippling too, because the hand-written list of six is what let two working pieces sit behind no door.

## Steps

Every case in `tests/doors.test.ts` is one step, and its name states its claim. The load-bearing ones:

- The enumeration finds every file under the engine's `bin/` that a person can run, and finds MORE than the six names `deliverable/tests/help.test.ts:24` lists today. A count equal to that list would mean the sweep is reading the list.
- The enumeration is not empty. A broken walk that returns nothing passes every other assertion, which is the failure mode the widget guard's own second case exists to catch.
- A write adding a departure line carrying a path and no reason is REFUSED, and the refusal names the file, the line number, and the reason as what is missing.
- A write adding a departure line whose reason is only whitespace is refused the same way. Emptiness after trimming is the boundary.
- A write adding a departure line with a one-word reason is ACCEPTED. The rule demands a reason, never a good one; judging quality is a reviewer's job and the list is what they read.
- A module that reaches a governed conversation and appears on no departure list is reported by the sweep.
- A module absent from the list is treated as governed, proved by adding a fresh reaching module and asserting it is reported without any list edit.
- The write-time guard refuses the ADDITION and not the edit. A file that already reaches stays writable, which is what lets the existing 81 be fixed rather than frozen.

### The manual step the files cannot carry

None. Every case runs in-process against the rule module.
