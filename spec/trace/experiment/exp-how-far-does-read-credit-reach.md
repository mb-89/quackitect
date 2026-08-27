---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: exp-how-far-does-read-credit-reach
type: "[[experiment]]"
statement: How far does a proved reading reach — across positions, across a reload, across a session?
probes:
  - raid-asm-read-evidence-outlives-the-session-that-produced-it
timebox: one day
form: tracer
faked: none — the engine's own reading ledger was read
fallback: none needed — the code states its own scope and its reasoning
verdict: holds
measured: "2026-08-26 — credit is per reader, written to the session settings, keyed per version, and lost with the hand; sessionreads.ts lines 88 to 100"
folds_to: raid-dec-read-credit-is-global-across-positions-and-never-across-sessions
promote: "none — nothing in the engine changes, because it already does what the ruling asks"
chunk: none — the wording of the kickoff goal is what moves, and it could not be amended without a reopen
source_refs:
  - rank-unknowns, the seeded pick
  - deliverable/engine/sessionreads.ts
  - "owner ruling, 2026-08-26"
---

## What the code says, quoted

`deliverable/engine/sessionreads.ts` lines 98 to 100:

> THE LEDGERS DO NOT SURVIVE A RESTART except the default reader's, which is
> what `restore` writes into. That is correct rather than a shortcut: a hand
> does not survive a restart either, so its reading cannot.

LINE 38 SAYS WHERE IT LIVES: the ledgers are "restored from and written to the
session settings", so credit is a file rather than memory alone.

LINE 84 SAYS IT IS ALREADY VERSION-KEYED, held per version like the person's own
checks.

LINE 88 SAYS WHY THERE IS ONE LEDGER PER READER: two hands walking the same
record have read different things, and only one of them can be asked.

## The three distances, answered separately

ACROSS POSITIONS, WITHIN A SESSION: yes. That is what makes the incoming slot
worth having, and it is the scope the goal meant.

ACROSS AN ENGINE RELOAD, WITHIN A SESSION: yes, through the session settings.
That is [[req-reading-credit-survives-a-reload]] and it is built.

ACROSS SESSIONS: no, deliberately. A new session is a new hand and it has read
nothing.

## The assumption was measuring against the wrong scope

THE ENTRY SAID FLATLY "It does not". It was reading the goal's word "global" as
meaning across sessions, which nobody asked for.

THE OWNER RULED IT ON 2026-08-26: closing the editor or starting a new agent
should not carry read evidence, and only a restart during a session needs it to
survive. That is what the engine already does.

## What the spike changes

NOTHING IN THE ENGINE. Every property the ruling asks for is already there.

ONE WORD IN THE KICKOFF GOAL, which could not be changed: the goals field is
read by every gate below, so amending it is a reopen and the owner forbade one.
The scope lives in the decision node instead.

A SWEEP FOR OTHER WRONG READINGS FOUND NONE. Two other nodes use the phrase and
both are correct under the right scope.
