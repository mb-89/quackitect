---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-asm-a-bound-check-runs-inside-the-write-budget
type: "[[raid]]"
kind: assumption
statement: A conformance check bound to the trace corpus can run on every write and still leave the write inside its one-second budget.
owner: the driving agent
trigger: the first bound check that reads more than the file being written
status: open
probe: "Time a write through se_file_write with one corpus-reading check armed, on the largest realistic corpus. Compare against the same write with no check. If the armed write stays under a second, the write path carries the checks. If it does not, the checks move to a batched runner and the write reports rather than refuses."
probed: "not yet — no bound check exists to time. The probe is cheap and belongs to this iteration's first build chunk, not to its gates."
impact: The whole thesis rests on it. Conformance runs at the WRITE precisely so a broken rule is heard when it is cheap. If a check cannot fit in a write, the checks fall back to a review and this iteration has rebuilt what it set out to replace.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - note-b93ad16c18a5
  - note-d7a26094f592
  - req-call-answers-in-one-second
  - i6 record vision — conformance moves to the WRITE path
---

THE ASSUMPTION, stated plainly. A check bound to an `el-` element or a
`dsp-` design spec has to read the trace corpus to know what it is
enforcing. A write has to finish inside a second.

Those two demands have never been put in the same call.

## Why it is not established

THE CORPUS IS NOT SMALL. Roughly 498 trace nodes carry `minted_in`, and
315 carry `source_refs`. A check that walks the graph on every keystroke-
sized edit walks that.

THE ENGINE ALREADY LEARNED THIS LESSON ONCE, in a neighbouring place. A
bare git spawn was measured at 40.6 ms of blocking, and the branch
listing was moved off a timer onto a ref stamp because the walk was not
computing, it was blocked. The same shape is available here and nobody
has measured it.

NOTHING IN THE PARKED DESIGN ADDRESSES COST. ArchUnit's shape was chosen
for how rules BIND, not for when they run. ArchUnit runs its rules in a
test suite, where a second is nothing. This iteration proposes to run
them in an interactive verb, where a second is the whole budget.

## Probe

Arm exactly one bound check. Time `se_file_write` with it and without
it, on this repository's corpus as it stands.

IF THE ARMED WRITE STAYS UNDER A SECOND, the write path carries the
checks and the thesis holds as written.

IF IT DOES NOT, the fallback is named ahead of time rather than
improvised: the checks move to a batched runner, and the write REPORTS
the break instead of refusing it. That is weaker than the goal and it is
still better than a review.

THE PROBE BELONGS TO THE FIRST BUILD CHUNK. It cannot run before a check
exists, and it must not wait until every check exists — by then the
architecture is committed.

## Falsification

One bound check whose armed write exceeds a second on this corpus.

That single measurement settles it, and no amount of reasoning about
caching substitutes for taking it.
