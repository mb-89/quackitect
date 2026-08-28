---
form: a-departure-with-no-reason-is-refused
by: agent
signed_off: 2026-08-26T14:02:33.780Z
authors: agent
files: null
---

# Evidence form / a-departure-with-no-reason-is-refused

## current_situation

The reason refusal stands, as `guardDepartureHasReason` in `deliverable/engine/doorguard.ts`.

### What it refuses

A departure line carrying a path and nothing after the dash. Whitespace alone counts as nothing, because the reason is trimmed before it is judged.

It names three things: the file, the line counted in the file, and the offending path quoted back. Its remedy is the exact patch that adds a reason to that line.

### What it does not judge

QUALITY. A one-word reason passes.

That is deliberate and it is measured rather than assumed. `exp-do-the-lists-that-demand-a-reason-collect-considered-ones` read 113 reasons a refusing verb has actually collected in this tree. 104 are considered. The 9 that are not sit in a single record where the honest answer genuinely was the same nine times.

Judging quality is a reviewer's job, and the list is what they read.

### It parses only its door's own section

A bullet outside a section belongs to no door. Without that, two doors would read each other's departures and a module allowed past one would be silently allowed past all of them.

### The suite ran, and both reds are resolved

The engine chose a wide scope because `errors.ts` changed, and 1651 cases ran with two failures.

One is mine and is fixed. One is not mine and is proved not to be.

## built

`guardDepartureHasReason` in `deliverable/engine/doorguard.ts`.

`deliverable/tests/files.test.ts` raises its read ratchet from 116 to 120, with the reason written above the constant as that guard's own message asks for.

The four reads are `doors.ts` three times and `doorguard.ts` once. The node door cannot hold them: `readNode`, `noteOf` and `nodeLines` share one read and one parse of a corpus NODE, and these read engine SOURCE and a machine list.

The machine commits.

## follow_up

- The sweep is next, then the write-path wiring. Both lean on what now stands.
- `deliverable/tests/drift.test.ts:589` is red and it is not this record's. Captured as `note-9d697da7ff83` with its evidence.
- The reason refusal has no population yet. It gets one as the departure list grows, which is the ready-when on `raid-asm-an-author-refused-at-write-time-states-a-usable-reason`.

## anything_else

### The read ratchet caught my own door for bypassing the existing door

That is worth saying plainly, because it is the rule this record is building, applied to the record itself by a guard that already existed.

The honest answer is a departure with a reason, and it is the same reason the departure list already records for `doors.ts`. The rule that decides who may read and write has to read the tree to answer, and a door that could not reach its own conversation could not exist.

### The other red predates this record, and here is how that was established

`drift.test.ts:589` fails at 898 door accesses against a ceiling of 800.

The ceiling is `FILLERS * 4`, a constant 200 times four. The test's own comment records the calibration at 245 accesses over 200 fillers and 25 claimful states. The failure reports 35 claimful states.

The fixture seeds a FRESH iteration from `readRigorMatrix(root)`, so the state count is the method's rather than any record's. This record's diff touches no rigor-matrix file, and the only engine file it modifies is `errors.ts`, which gains two constants.

The defect that guard names did not happen. Its first assertion is that the corpus is asked for exactly once, and that assertion passed. Only the ceiling is stale.

Two data points cannot recalibrate it: 245 at 25 states and 898 at 35 fit no line with a non-negative fixed part. Writing a new ceiling from them would be curve-fitting, so the note asks for a fresh measurement instead.
