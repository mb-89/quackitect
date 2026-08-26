---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-does-a-corpus-reading-check-fit-inside-the-write-budget
type: "[[experiment]]"
statement: Does a check that reads the whole corpus fit inside a write's one-second budget, measured by reading every corpus file before a write and timing it?
probes:
  - raid-asm-a-bound-check-runs-inside-the-write-budget
timebox: one measured write with a corpus-reading check on it
form: script
chunk: none — all 1782 corpus files were read on every round
faked: the CHECK itself. The run reads every corpus file, which is the expensive half, and does not parse or judge them. Parsing is measured separately on the sweep and is the larger cost there.
fallback: pre-agreed at seeding. If the check cannot fit in a write, it moves to the sweep — which is a demotion the whole conformance design was built to avoid.
verdict: holds
measured: 2026-08-26. Reading all 1782 corpus files costs 18.2, 18.1 and 19.7 ms across three rounds, against a 1000 ms budget. About fifty times the headroom.
folds_to: The assumption holds and its corpus-reading half is closed. The design argument that cited the write budget as a reason to avoid a corpus check loses that leg, so the exactness the winner traded away can be bought back at the build if it is wanted. A write-time PARSE is a separate question and stays open.
promote: none - the finding is the product
source_refs:
  - rank-unknowns, the seeded pick
  - req-call-answers-in-one-second — the budget this is measured against
---

## Setup

The content-only half was already measured on 2026-08-16, from the call log. Twelve consecutive `se_file_write` calls of 2251 to 3086 bytes ran in 4 to 12 ms.

What stayed open was the corpus-READING half. No check in the tree exercises it, because the design was shaped so none has to.

This run reads every file the corpus holds before a single write, three times, and reports the wall clock.

## Result

HOLDS, WITH ABOUT FIFTY TIMES THE HEADROOM.

Three rounds: 18.2 ms, 18.1 ms, 19.7 ms. The budget is 1000 ms.

### What is faked, and it matters

The run reads the files. It does not parse or judge them.

Parsing is the expensive half elsewhere: the sweep's YAML parse over 3117 nodes costs 614 to 708 ms. A write-time check that PARSED the whole corpus would be a different measurement and would not have this headroom.

So the honest claim is narrower than the verdict word suggests. READING the corpus at write time is free. Parsing it is not, and nothing here measured a write-time parse.

### This goes against the design that won

The winning design was shaped to avoid a corpus-reading check at write time. The budget was one of the reasons given.

THE BUDGET WOULD NOT HAVE FORCED THAT SHAPE. At 18 ms against 1000 ms, a reading check was never the constraint.

Whatever else recommends the winner, this reason does not. Saying so is the point of running the spike after the design rather than before it.

### What it frees

The exactness the winner traded away can be bought back, if the build wants it. A check that reads the corpus to decide whether a departure is still justified costs about 2 percent of the budget.

A check that PARSES the corpus to do the same is a separate question and is still open.
