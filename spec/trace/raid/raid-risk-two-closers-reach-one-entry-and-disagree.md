---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-risk-two-closers-reach-one-entry-and-disagree
type: "[[raid]]"
kind: risk
statement: A run closing its own entry and a heartbeat closing the same entry can reach it at once, and the second closer can reopen or double-count what the first already settled.
owner: the maintainer
trigger: the first entry observed with two close records, and any change that adds a third way to close one
status: open
looked: 2026-08-24
impact: A reopened entry is the original fault wearing the fix's clothes. A double-counted one corrupts the figures the account reports, and those figures are what a walk acts on.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: raid-iss-a-finished-run-keeps-reporting-itself-as-running
weighs_against: none
---

## Why two closers exist at all

THE RECORD CHOSE BOTH ON PURPOSE. A run closing itself is the direct fix. A
heartbeat is the backstop for a run that cannot close itself, because it
crashed or was killed.

ONE CLOSER WOULD BE SIMPLER and it is what the system has today. Today is the
arrangement that left three entries standing for fifteen hours.

## The story, with no coincidence in it

A process exits at the moment the interval falls due. The run's own close and
the heartbeat's close both fire against one entry.

## What the goal conflict ruled

RULED FOR BOTH CLOSERS, WITH AN IDEMPOTENT CLOSE. The second closer must find
the entry already settled and do nothing.

NOT REOPEN IT. Not count it again. Not record a second outcome over the first.

## What would make this the wrong call

Finding that the two closers disagree about the OUTCOME rather than about the
timing. A run that exited cleanly and a heartbeat that ended it report
different things, and an idempotent close silently keeps whichever arrived
first. If that happens, the close needs a precedence rule and not just an
idempotence rule.
