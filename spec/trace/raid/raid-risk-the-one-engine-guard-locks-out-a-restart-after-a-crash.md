---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash
type: "[[raid]]"
kind: risk
statement: "A guard strong enough to stop a second engine on one folder is strong enough to stop a legitimate restart after the first one crashed."
owner: the maintainer
trigger: "the first engine that refuses to start on a folder with no engine running on it"
status: open
looked: 2026-08-24
impact: "A folder nobody can start an engine on is a folder nobody can work in. On an unattended machine there is no person to clear the obstruction, so the run is over."
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: none
weighs_against: raid-risk-two-engines-run-one-folder-and-neither-says-so
---

## What the guard is for

FOUR PROCESSES WERE OBSERVED on one machine, in two parent-and-child pairs,
started 47 seconds apart with identical arguments.

WHAT THE SECOND ONE DOES WHEN THE BIND FAILS was an open question on
2026-08-24, until a restart that same day took the session down and answered
it.

## The story, and why it takes two things

A crash leaves a lock file behind. A later start reads the lock, believes an
engine is running, and refuses.

THAT NEEDS THE CRASH AND THE LOCK-FILE DESIGN TOGETHER, which is why this is
conceivable rather than plausible. Choosing the other design removes it
outright.

## What the goal conflict ruled

RULED FOR THE PORT BIND AS THE ONLY TRUTH. A live listener is a fact. A lock
file is a guess, and a stale guess turns a recoverable crash into a dead
folder.

SO THE GUARD IS THE BIND ITSELF. Nothing is written down that could go stale,
because the operating system already holds the answer.

## What would make this the wrong call

A host where two engines can bind one port, or where the bind succeeds against
a dead listener. Then the bind is not the fact it is being treated as, and the
guard needs a second signal.
