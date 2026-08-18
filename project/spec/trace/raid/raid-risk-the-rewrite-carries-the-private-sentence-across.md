---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-risk-the-rewrite-carries-the-private-sentence-across
type: "[[raid]]"
kind: risk
statement: The rewrite is the privacy boundary, and a rewrite that copies the note's own sentence carries whatever was private in it straight onto trunk.
owner: the owner
trigger: the first mint, and every mint after it
status: open
impact: The whole hard line rests on one act performed by whoever is draining. A rewrite that is really a copy passes every check the mechanism has, because the mechanism cannot read intent. And a leak on trunk cannot be undone - history keeps it, and SE-C-002 forbids rewriting history.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
weighs_with: none
weighs_against: none
---

## Why it is plausible rather than conceivable

THE EASIEST REWRITE IS A COPY. Draining is bulk work at a retro, the note
already says the thing, and pasting it is one keystroke less than writing a
sentence. Nothing in the act resists that, and the person doing it is under
time pressure by construction - the inbox is drained in a batch.

MEASURED PRECEDENT, from the other direction: prose-inspect exists because
usernames and home directories DID reach stored records, and it found real ones
before this session muted its false ones.

## What would reduce it

- THE MINT REFUSES A STATEMENT THAT IS THE NOTE'S OWN TEXT. A cheap check: if
  the option's statement appears verbatim in the raw note, it was not written,
  it was moved.
- prose-inspect ALREADY WALKS project/spec for identity needles, and a minted
  option lands there, so the existing sweep covers the pool the day it exists.
  That is coverage the design gets for free and should not be given up.

## What does NOT reduce it

A REVIEW STEP AFTER THE MINT. By then it is committed, and the register's own
rule about history applies: superseded content stays.
