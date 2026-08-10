---
steps:
  - id: trunk-read-cost
    statement: "spike raid-dec-thin-tree's bet — measure per-access trunk-ref reads of method files, cold and warm, on this machine; timebox half a day"
    depends_on: []
    realization: document
  - id: latency-ledger
    statement: "spike raid-ar-call-answers-in-one-second — the recorded serving-call distribution against the one-second line, worst offenders named; timebox two hours"
    depends_on: []
    realization: document
  - id: kill-and-resume
    statement: "spike raid-ar-resume-needs-no-person — kill the engine mid-walk and resume from the repository alone, position intact; timebox half a day"
    depends_on: []
    realization: document
---

# The spike drawing

One spike state per ref on rank-unknowns' seeded list. Three refs were
listed, so there are three states.

They are independent and run in parallel, exactly like the candidate
drawing: all hang off start, and the join waits for every one.

## What each state writes

ONE EXPERIMENT NODE per spike (the [[experiment]] item template): the
question, the timebox, the form, what was faked, the pre-agreed fallback,
the measured result, the verdict.

The finding also lands in the register entry it probes — the entry's body
takes the dated measurement, and its status or likelihood moves if the
finding moves it. The experiment node is the run's record; the register
entry is the standing claim. The evidence form carries pointers, never a
second copy.
