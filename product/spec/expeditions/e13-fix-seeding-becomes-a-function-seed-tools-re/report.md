---
form: expedition-leave
status: done
by: agent
files:
---

# e13-fix-seeding-becomes-a-function-seed-tools-re — expedition-leave

## What was the goal

Seeding stops being a door and becomes a function. A seeded iteration
must stand visible in the iterations container from the moment of
seeding. The container pair renames to plain expeditions and iterations.
The needs-retro gate moves onto the first start of a never-walked
iteration.

## What was done

Two seed tools, both hands: se_seed_expedition (was se_exp_new) and
se_seed_iteration (goal + rough vision + input refs, a small form —
an empty vision is refused). A seed mints the record and worktree on
branch it/<id>; the iterations container generates one KICKOFF state per
open iteration, gate armed until its first start stamps `started:`.
Seeding is legal at idle, in the retro's drain, and at an expedition's
leave — the expedition rides as input there.

The start_expedition and start_iteration machines are deleted;
continue_expedition became expeditions, continue_iteration became
iterations. Idle has six doors.

Rounding the walk-through notes: the archive's report link now opens in
the big modal (ctrl tab, shift window), dismissed reports read from
their branch; the UX law landed — open folds survive a checkbox reload,
with the rule in voice.md; update rows render bold and yellow.

## What settled it

The suite: 84/84 selftests and preflight green in this worktree — three
new iteration tests walk the seed, the small-form refusal, and the full
gate story (seed → blocked first start → retro drain → open, started
stamped, worktree bound). The container round-trip, threshold, reads and
escape suites all walk the renamed doors.

## What was not done

The kickoff is a stub: it decides nothing yet — the rigor matrix and
the seeding of an iteration's remaining states from the kickoff outcome
are the iteration-lane build. The divergence move (seed an expedition
from INSIDE an iteration, enter instantly, one notch above the slider)
is specified but unreachable until iterations are walkable; it ships
with that lane. The iteration archive stays a drawn stub. se_test stays
a pending planning lead.

## Files


