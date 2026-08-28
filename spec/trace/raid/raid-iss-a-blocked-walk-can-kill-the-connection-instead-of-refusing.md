---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: raid-iss-a-blocked-walk-can-kill-the-connection-instead-of-refusing
type: "[[raid]]"
kind: issue
statement: A walk that cannot proceed sometimes closes the connection instead of answering with a typed refusal, and the failure reaches no log.
owner: the engine maintainer
trigger: any pull that answers with a dropped socket rather than a result
status: open
impact: The agent is left guessing at a cause the engine already knows. It cost seven calls of diagnosis and one confident wrong answer to the owner on 2026-08-16, and the call log holds no record of any of it.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-477b27d4bd20
  - note-360a599a263a
weighs_with: none
weighs_against: none
place: i67-a-failure-the-caller-can-cause-arrives-t
---

## What happened, three times

Entering i34 answered "The socket connection was closed unexpectedly". The
engine survived and kept serving other verbs. A reload cleared it, so the cause
was a running engine that predated the seeded iteration.

TWO THINGS ARE WRONG AND THEY ARE SEPARABLE.

- THE REFUSAL NEVER ARRIVED. guidance/refusals.md states the rule this breaks
  in its own words: "ANYTHING THAT BLOCKS OWES A REMEDY, NOT ONLY A TYPED
  REFUSAL... THE MACHINE HOLDS THE VERDICT, SO THE MACHINE HANDS IT OVER."
- NOTHING REACHED THE LOG. `se_log_query {tool: se_pull, ok: false}` shows no
  record of any of the three; the newest failed pull is from the previous day.
  The log is the only witness the system has, and it did not see the worst
  failure of the session.

## The third symptom, which the owner turned into scope

After each crash, a bare recovery pull entered `iterations/i4` — the first
alternative in the offered list — rather than reporting that no choice had been
made. Three times.

The container's own guidance promises the opposite: "with several open the pull
OFFERS them rather than entering one for you."

Entering BINDS a record and stamps it started. i4 was already started so
`markStarted` returned early and nothing was written. A freshly seeded stub
would have been started by a dropped socket.

THE OWNER RULED A SELECTION STATE for this, and it is in i34's scope.
