---
form: records-home
by: agent
signed_off: 2026-08-15T11:19:07.522Z
authors: agent
files:
---

# Evidence form / records-home

## current_situation

The reporter derived its output directory from its own working directory, two levels up. Its own comment apologised for it: a reporter has no argv to be told this.

While an iteration is bound, the spawner's root is that iteration's WORKTREE. So the reporter wrote into a .se the lane never resolves, and every write in it sits inside a try that swallows its error.

Two green batteries on 2026-08-15 recorded 1301 rows each into a directory nothing opens, and neither said so.

## built

Committed in 2033e175.

- engine/testreporters.ts exports TIMINGS_DIR_ENV, the key the reporter reads.
- engine/bin/test-timings.mjs takes its output directory from that variable, keeping the old cwd form only as a fallback for a hand-run.
- engine/bin/selftest.ts takes the same variable for its own progress and summary writes, and PRINTS where it recorded.
- engine/tools.ts passes the lane's own .se on both the battery spawn and the scoped spawn.

THE ROOT CAUSE WAS PROVEN, NOT GUESSED. Running selftest directly printed:

  timings home: ...\.worktrees\i12-performance-hold-the-one-second-rule-on-\.se

That one line settled a question four earlier probes had circled, and it is why the print stays in rather than being removed after the diagnosis.

## follow_up

- THE TOOLS.TS HALF IS NOT LIVE. The running engine loaded before this change, and a reload needs the walk at idle. The selftest half is live already, because the battery spawns it from disk.
- So the end-to-end proof is owed at the next reload: run the battery, then read .se/test-timings.jsonl at the machine root and see it grow.
- raid-iss-a-bound-record-records-no-test-timings closes when that reading is taken. It stays open until then rather than being marked fixed on the strength of the code.

## anything_else

ON KEEPING THE PRINT.

A line that says where a run recorded looks like debugging left in. It is the smallest form of the rule this whole chunk exists to enforce: a bookkeeping write that may never fail the suite must still be able to say what it did.

The defect was invisible for a day and two full batteries. What made it visible was not a test and not a diagnosis. It was one line of output naming a path.

ON WHY THE CWD FALLBACK STAYS.

Somebody running selftest by hand from project/deliverable sets no variable, and the old behaviour is right for them. The fallback is not a hedge against the fix being wrong; it is the honest answer for a caller the spawner does not own.
