---
id: i51-work-running-out-of-sight-reports-itself
status: seeded
opened: 2026-08-20T19:30:59.867Z
goal: "Work running out of sight reports itself: one call lists every background job with how much longer it needs, and a long exit script stops freezing the pull."
vision: "THE PROBLEM, in one line: an agent with a background job has no way to ask how long, so it polls every two seconds and the log fills with nothing.\n\nWHAT DONE LOOKS LIKE.\n\n- One lane call lists EVERY piece of work running out of sight. Test runs and shell jobs in the same answer, not two lists that each hold half.\n- Each entry carries a figure for how much longer it needs, not a rate. A caller that reads \"about forty seconds\" waits forty seconds.\n- That figure comes from what the job has already done against what it has left. A battery knows its case count from the previous run, so the estimate is arithmetic rather than a guess.\n- The state rides ordinary calls too, so an agent doing other work learns a job finished without asking.\n- A long exit script starts, answers at once, and hands back its verdict on a later call. It never freezes the pull.\n\nWHY IT SUITS AN UNATTENDED RUN. Every part is mechanical. The inputs are already recorded: the job table, the previous battery's case count, the timings each run writes. Nothing here needs a judgment about the product, and the acceptance test is a scripted one — start a job, ask, check the answer names a time and counts down.\n\nTHE TWO TOKENS THIS COLLAPSES each name the other as their precondition, so neither can ever come up in a sweep. Building them as one piece is what both of their conditions are groping towards when they say the two pair as one design.\n\nAN OPTIONAL THIRD PIECE, and the owner has said it is not mandatory: the engine choosing the battery scope better. It already decides, but it falls back to the whole battery whenever a changed file has no test that answers for it, which today is most document changes. Take it only if it fits without stretching the record."
inputs:
  - "wt-one-lane-call-should-report-the-state-of-every-piece-of-work"
  - "wt-a-step-whose-leaving-condition-runs-a-long-program-should-no"
  - "note-5781601b7e63"
  - "note-e60589fca3c2"
depends_on: []
---

# i51-work-running-out-of-sight-reports-itself

## Goal

Work running out of sight reports itself: one call lists every background job with how much longer it needs, and a long exit script stops freezing the pull.

## Rough vision

THE PROBLEM, in one line: an agent with a background job has no way to ask how long, so it polls every two seconds and the log fills with nothing.

WHAT DONE LOOKS LIKE.

- One lane call lists EVERY piece of work running out of sight. Test runs and shell jobs in the same answer, not two lists that each hold half.
- Each entry carries a figure for how much longer it needs, not a rate. A caller that reads "about forty seconds" waits forty seconds.
- That figure comes from what the job has already done against what it has left. A battery knows its case count from the previous run, so the estimate is arithmetic rather than a guess.
- The state rides ordinary calls too, so an agent doing other work learns a job finished without asking.
- A long exit script starts, answers at once, and hands back its verdict on a later call. It never freezes the pull.

WHY IT SUITS AN UNATTENDED RUN. Every part is mechanical. The inputs are already recorded: the job table, the previous battery's case count, the timings each run writes. Nothing here needs a judgment about the product, and the acceptance test is a scripted one — start a job, ask, check the answer names a time and counts down.

THE TWO TOKENS THIS COLLAPSES each name the other as their precondition, so neither can ever come up in a sweep. Building them as one piece is what both of their conditions are groping towards when they say the two pair as one design.

AN OPTIONAL THIRD PIECE, and the owner has said it is not mandatory: the engine choosing the battery scope better. It already decides, but it falls back to the whole battery whenever a changed file has no test that answers for it, which today is most document changes. Take it only if it fits without stretching the record.

## Inputs

- wt-one-lane-call-should-report-the-state-of-every-piece-of-work
- wt-a-step-whose-leaving-condition-runs-a-long-program-should-no
- note-5781601b7e63
- note-e60589fca3c2
