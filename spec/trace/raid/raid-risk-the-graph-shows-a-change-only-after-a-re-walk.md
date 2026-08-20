---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-risk-the-graph-shows-a-change-only-after-a-re-walk
type: "[[raid]]"
kind: risk
statement: A change to the graph appears only after something walks over it, so the panel and the repository can disagree indefinitely.
owner: the owner
trigger: any state reported green that a later look drops, and any restart that has to re-walk to reach where it stood
status: open
impact: A chain can stand green over an unfinished input for as long as nobody asks. Three quality scenarios sit on this one root - resuming from the repository, surviving a host swap, and a person orienting from the panel unaided.
breaks_how_badly: crippling
how_likely: expected
probe: observed 2026-08-15, three times in one session. Six states stamped over an unfinished input and stayed green until an amendment forced re-evaluation. A reload dropped the target and the decision graph. Re-standing a claim whose ground had moved needed a hand-written amend carrying no new information.
probed: 2026-08-15
source_refs:
  - req-walk-resumes-from-repo
  - req-walk-survives-host-swap
  - req-resume-needs-no-person
---

## The hinge

THE GRAPH KNOWS THE ANSWER AND DOES NOT COMPUTE IT until something walks over
it. Green is computed on a look, and nothing forces a look when the graph
changes.

THE OWNER NAMED IT PLAINLY on 2026-08-15: "we still have a problem that
changes in the graph don't just instantly appear. If we change the graph, it
should just instantly recompute."

## Three faces of one defect

- RESUMING. A reload came back at the front desk with an empty target, and the
  walk needed a manual re-aim to reach where it had stood.
- HOST SWAP. The same mechanism carries the same cost, since a swap is a
  restart with a different machine underneath.
- THE PANEL. A person reading it sees the last computed answer, not the
  current one.

## The tradeoff

RECOMPUTING ON EVERY LOOK IS WHAT THE STAMPED GREEN PASS EXISTS TO MAKE
AFFORDABLE. Entering one record once asked for the same corpus sixty-six
times.

SO THE MACHINERY IS ALREADY THERE and the question is what triggers it, rather
than whether a recompute can be paid for.

## What it is NOT

NOT A REWORK PROBLEM. The re-walk cost nothing but calls: 26 states came back
green with no form re-filled and no judgment re-made.

THE COMPLAINT IS THAT A CHANGE NEEDS A WALK TO SHOW UP, not that the walk is
expensive.

## Scope

NOT THIS ITERATION'S. The owner set i28's target as running in the cloud and
said so plainly. This is carried for the retro, and [[note-f7777e741479]]
holds the same finding for draining there.
