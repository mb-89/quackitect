---
form: the-account-rides-every-answer
by: agent
signed_off: 2026-08-21T11:19:13.181Z
authors: agent
files:
---

# Evidence form / the-account-rides-every-answer

## current_situation

The account existed and nobody was told about it. A caller had to know to ask `se_run {jobs: true}`, which is the opposite of an account that follows you.

IT RIDES NOW, from the one place every lane answer is composed. The caller's own answer is untouched; `work` is a second field beside it.

AN EMPTY ACCOUNT IS AN EMPTY LIST. Never an absent field, because absent cannot be told apart from a build that never emitted one — the first of the two findings the re-scoring pass raised against this design.

HISTORY DOES NOT RIDE. Work that ended before this session looked answers to `se_run {jobs: true}`; it is not repeated on every call for ever.

## built

THREE FILES CHANGED.

`deliverable/engine/run.ts` — a new `workAccount` returns everything still running plus anything that finished since the last look. Two sets carry the third standing: `seenRunning` remembers what this session watched, and `reported` remembers what a caller has already been told. An operation is running, then finished, then read.

`deliverable/engine/tools.ts` — one decorator in `buildServer`'s own chain attaches `work` to every result. It sits beside the ones that already attach the banner, the typecheck report and the narration result, so the seam is the one that already existed.

`deliverable/tests/work-account.test.ts` — two cases. `an account with nothing in it is an empty list, not an absent one`, and `work that ended before this session looked does not ride`.

MEASURED, 2026-08-21: five cases in that file, all five pass. The typechecker is clean and biome checked all three files with no fixes.

## follow_up

THIS STRAND IS FINISHED. Four chunks: the table, the account, the figure, the rider.

THE HANDBACK STRAND IS ALL THAT REMAINS, and it is where the fatal risk lives. Four chunks: stop awaiting the leaving judgment, give a step's standing three words, land the verdict against its step, and decide what a fresh session does with a step it finds deciding.

THE TWO HANDBACK REDS ARE STILL RED and they are the target list. Neither has moved since author-tests wrote them.

ONE THING TO WATCH AT VERIFICATION. Every lane answer now grows by a `work` field, so more answers will cross the spill bound. The cursor already handles that, and `req-oversized-results-remain-recoverable-through-the-lane` was ruled addressed at the ATAM walk for exactly this reason.

## anything_else

THE THIRD STANDING IS WHAT KEEPS THE RIDER SMALL, and that is worth saying because it looked like bookkeeping when it was written.

WITHOUT IT the rider would carry every operation the root remembers, on every call, for ever. Thirty-five entries were on disk when this was measured.

WITH IT a caller is told about each outcome ONCE. What is running always rides; what finished rides on the next answer and then stops.

THAT IS THE UNPRICED BOOKKEEPING THE RE-SCORING PASS FLAGGED, and it turned out to be two sets of ids in memory. The cost that remains is one progress read per live operation per call, which is recorded against [[raid-ar-one-operation-reads-its-input-once]] rather than hidden.
