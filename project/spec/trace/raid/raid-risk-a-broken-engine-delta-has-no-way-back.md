---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: raid-risk-a-broken-engine-delta-has-no-way-back
type: "[[raid]]"
kind: risk
statement: A satellite that comes up on a broken engine delta has no route back to the composition that was serving before it.
owner: the maintainer
trigger: the first engine override that rebases cleanly and then fails to run
status: accepted
impact: The record cannot be walked, and the walk is the only door to the file that broke it — the agent is locked out of the fix by the thing they are fixing.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - el-satellite-supervisor
  - if-engine-delta-to-satellite
  - req-an-engine-change-applies-in-its-own-record
  - https://nginx.org/en/docs/control.html
---

Found by this gate's prior-art round, 2026-08-14.

## What the structure catches and what it does not

[[el-satellite-supervisor]] catches a delta that will not APPLY. Its START act
rebases the delta on trunk and stops the record at entry with the conflict
named.

It says nothing about a delta that applies and then does not RUN. A syntax
error, a bad import, a module that throws at load — the rebase is clean and
the satellite dies on the way up.

## Why the walk cannot fix it

Contract rule 1: the lane is the only door. The engine delta is edited through
the lane, and the lane is served by the satellite that will not start.

So the failure removes the tool needed to repair it. That is what makes this
crippling rather than an inconvenience.

## What the prior art does instead

nginx.org/en/docs/control.html, on the HUP signal: "The master process first
checks the syntax validity, then tries to apply new configuration... If this
fails, it rolls back changes and continues to work with old configuration."

The USR2 executable upgrade goes further. Old and new master processes both
run, both sets of workers accept requests, and if the new binary is
unacceptable the old master starts its workers again.

Two properties our supervisor does not have: a validation step before the
swap, and a previous composition still alive to fall back to.

## What would close it

Either is enough on its own.

- Validate the composed machine before retiring the old satellite, the way
  nginx validates a configuration before starting new workers.
- Keep the previous composition until the replacement has served one call,
  the way nginx keeps the old master until the new one is trusted.

## Why it is a risk and not an issue

Nothing has been built yet. The supervisor is a new element on this chart and
this is a gap in what it declares, caught before the build rather than after.

## The owner's ruling, 2026-08-14

Adopt the prior art. "Why can't we do it like that? We are in the
architecture phase. Stuff like this we can decide later. If that makes sense
for us, note it, and then we can implement it like that."

So this entry is ACCEPTED rather than open: the gap is real, the shape of the
fix is known, and it lands at specify-build as a property of
[[el-satellite-supervisor]]'s REPLACE act.

A spike is offered and not required. Carried as note-bfcc7382f85d.
