---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-read-evidence-outlives-the-session-that-produced-it
type: "[[raid]]"
status: closed
kind: issue
statement: "The design mints an input token only where reading evidence is absent, which assumes that evidence outlives the session that produced it. It does not."
owner: the driving agent
trigger: "the design step that says where a reading token's proof lives, and the first restart during a record that has already proven its reading"
probe: "false. The check ran at the real channel on 2026-08-26 and the assumption did not survive. deliverable/engine/sessionreads.ts line 101 holds the ledgers as an in-memory Map, line 88 states that a proof belongs to the head that read rather than to the record, and line 98 says the ledgers do not survive a restart except the default reader's. The kind is changed to issue: it has already happened."
probed: 2026-08-26
impact: "An input token is a durable file. Its proof is not. So a record re-entered after a restart either re-owes reading it has already done, or the token reports itself satisfied by a store that no longer holds anything."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## CLOSED BY OWNER RULING, 2026-08-26 — it does not need to survive the session

THE RULING: closing the editor or starting a new agent should NOT carry read
evidence. Only an engine restart DURING a session needs it to survive.

THAT IS ALREADY WHAT IS BUILT, and it is what the engine's own comment argues.
A hand does not survive a restart, so its reading cannot.

SO THE ENTRY WAS MEASURING THE DESIGN AGAINST A SCOPE NOBODY ASKED FOR. It read
the goal's word "global" as meaning across sessions. The sensible reading is
across POSITIONS within one hand's session: read a document once, and do not owe
it again at the next state demanding the same document.

ONE THING SURVIVES THE CLOSING. The goal's word "global" is ambiguous enough to
mislead a careful read, and it is better written as "across positions, within
one hand's session".

THE GOAL ITSELF COULD NOT BE APPENDED TO. The engine refuses an amend to the
goals field, because every gate below reads it and a changed question is a
reopen. The owner ruled nothing was to be reopened for this, so the scope lives
in [[raid-dec-read-credit-is-global-across-positions-and-never-across-sessions]]
instead.

THE SWEEP FOR OTHER WRONG READINGS FOUND NONE. Two other nodes use the phrase
and both are correct under the right scope: one says entering twice asks for
nothing already proven, which is exactly across-positions; the other says a
finished thing's proof survives a restart, which is exactly the reload the owner
says must survive.

WHAT WAS FOUND AT THE CODE, kept because it is the evidence:

THE ENTRY SAID FLATLY "It does not". That is wrong in one direction and not
sharp enough in the other.

## What survives

A RELOAD DOES NOT LOSE IT. `deliverable/engine/sessionreads.ts` line 38 says the
gate's ledgers are "restored from and written to the session settings", so
credit is written to a file rather than held only in memory. That is
[[req-reading-credit-survives-a-reload]] and it is built.

CREDIT IS ALREADY VERSION-KEYED. Line 84: proofs are held "per version, like the
human's checks". So half of what the goal asks for stands today.

## What does not survive, and why that is deliberate

Lines 98 to 100, quoted whole because the reasoning matters:

> THE LEDGERS DO NOT SURVIVE A RESTART except the default reader's, which is
> what `restore` writes into. That is correct rather than a shortcut: a hand
> does not survive a restart either, so its reading cannot.

A SPAWNED HAND'S CREDIT DIES WITH THE HAND, on purpose. Line 88: one ledger per
reader, because "two hands walking the same record have read different things,
and only one of them can be asked". It was one shared ledger once, and that let
a freshly spawned walker inherit credit for pages it had never seen.

## What is left for the build, and it is one word

NOTHING IS BROKEN. Credit is per reader, written to the session settings, keyed
per version, and lost when the hand is lost. Every one of those is what the
owner's ruling asks for.

THE GOAL'S WORDING IS WHAT MOVES. "Global" becomes "across positions, within one
hand's session", so nobody reads it the way this entry did.

## Probe

READ THE REAL CHANNEL rather than the comment above it. Open
`deliverable/engine/sessionreads.ts` between lines 75 and 124 and answer one
question: are the ledgers per-reader in-memory maps that do not survive a
restart?

IF THEY ARE, THE ASSUMPTION IS ALREADY FALSE and this entry becomes an issue
rather than staying open.

RUN 2026-08-26, AND IT IS FALSE. Line 101 declares the ledgers as a Map held
on the object. Lines 88 to 100 say in the code's own words that a proof
belongs to the head that read and that the ledgers do not survive a restart.

## What the code says

THIS WAS CHECKED RATHER THAN ASSUMED, and the check contradicts the design's
own input.

- `sessionreads.ts` line 81 keeps the person's checks in an in-memory map.
- Line 88 states the rule outright: a reading proof belongs to the HEAD that
  read, never to the record.
- Line 98 says the ledgers do not survive a restart, except the default
  reader's.

EVERY ONE OF THOSE IS DELIBERATE. A freshly spawned hand must re-owe what it
has not read, and a hand does not survive a restart either, so its reading
cannot.

## Why it was recorded as already true

THE DESIGN INPUT SAID NOTHING NEW WAS OWED HERE, and three evidence forms
repeated it, each citing a COMMENT at `mirror.ts` line 174 rather than the code
beneath it. That comment is correct and says nothing about globality.

AN INDEPENDENT REVIEWER FOUND IT by following the citation into the
implementation. The register had earlier REFUSED this entry, on the ground that
an assumption checkable in under a minute gets checked rather than logged. The
check was run and got the wrong answer, which is a different failure from not
checking.

## Which half is true

VERSION-KEYING IS BUILT AND NEEDS NOTHING. A changed file brings the reading
requirement back by itself.

GLOBALITY IS NOT BUILT. It is a target of this design rather than a property it
inherits.

## What closes it

A RULING ON WHERE A READING TOKEN'S PROOF LIVES, and there are two honest
answers with different costs.

- A store that outlives the session, keyed per record rather than per hand.
  That contradicts the reason the ledgers are per-hand today, so the
  contradiction has to be resolved rather than ignored.
- Re-owing the reading on every restart, which is cheap and honest and costs
  the walk time it already costs today.
