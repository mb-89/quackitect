---
form: judged-path
by: agent
signed_off: 2026-08-14T08:03:55.921Z
reopened: "2026-08-14T07:51:55.569Z — Its composition described a candidate that governs writes only, and the redrawn line now carries two coverage rules, so the seams it wrote are no longer the seams it has."
authors: agent
files:
---

# Evidence form / judged-path

## current_situation

cand-judged-path is RECOMPOSED after the owner found the defect that cost it the seat.

WHAT WAS WRONG. Its line governed writes and not reads, and it was scored on that gap on the FATAL axis. The chart's first row conflated the mechanism with what the rule covers, so this candidate could carry a predicate or a coverage rule and never both.

The row is now two rows. This candidate carries opt-separate-rules-for-reads-and-writes, which its predicate could always do - raid-dec-two-layer-auth's mechanism is "whether this call's path is allowed here", and a read is a call with a path.

TWO SECTIONS CHANGED AND THE REST STAND. The seam that matters is now the COVERAGE rather than the read, and the weakest point is now keeping two rules in step rather than reads being ungoverned.

NO STRUCTURAL REASON WAS EVER FOUND for the write-only reading, because there is none. The word write appears in the decision's statement and trigger because both were authored from the 2026-08-07 write breach.

## built

project/spec/trace/candidate/cand-judged-path.md - the picks list gains opt-separate-rules-for-reads-and-writes, and two sections are rewritten: the seam in How it works, and the first assumption in What it leans on.

No node minted. The candidate note the chart line created is the only artifact.

## follow_up

THE RECOMPOSITION CHANGED THE SCORE AND THE SCORE CHANGED THE FRONT. cand-judged-path moved from 2 to 3 on the fatal axis, and it is now EXACTLY TIED with cand-speaking-root on all twelve.

So the seat this candidate lost by one point was lost to a gap the chart forced on it.

THE REAL DIFFERENCE BETWEEN THE TWO LEADERS IS NOT ON THE CRITERIA LIST. Confinement fails SILENTLY when one code path bypasses the seam - the i8 field report of 2026-08-12 records that within days of the last guard landing. A predicate fails LOUDLY, by refusing.

Neither is better on any axis that survived the cut. If that difference matters, it is a MISSING CRITERION and it belongs at derive-criteria rather than being settled by whoever writes the convergence.

THE TWO-RULE DRIFT IS THIS CANDIDATE'S OWN NEW WEAKNESS and it is recorded on the node: one rule cannot drift from itself, two can.

## anything_else

WHAT THIS RECOMPOSITION PROVES ABOUT THE FIRST ONE.

The first composition was not sloppy. It described the line it was given accurately, named the ungoverned read as the candidate's weakest point, and carried that into the scoring honestly.

The defect was upstream, in the chart, and every downstream state faithfully propagated it. That is the shape worth remembering: a correct process over a malformed input produces a confident wrong answer, and nothing in the process is where the error is visible.

Only a person asking why an incomplete solution was compared with a complete one found it. Recorded as note-3b6264ca20c9.
