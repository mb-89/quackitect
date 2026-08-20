---
minted_in: i2
id: raid-debt-delta-default-views
type: "[[raid]]"
kind: debt
statement: The reference views still list the whole corpus - the minted_in stamps stand, but the resolvers do not yet default to the bound record's delta with the corpus opt-in.
owner: the driving agent
trigger: the next form opened in a record whose table lists another record's nodes, or the owner's next reiteration of the delta demand
status: open
looked: 2026-08-19
breaks_how_badly: abrasive
how_likely: expected
impact: Every reference table in a record lists the standing corpus beside the delta - 38 test-specs where 7 are the iteration's own - and the reader wades through history, exactly what the owner has flagged three times.
source_refs:
  - req-nodes-scoped-to-iteration
  - note-db7c72bd519c
---

Taken knowingly at the b10 signing: the stamp at mint and the corpus
backfill landed and test green; the resolver default and the opt-in
toggle did not. The cost compounds with every node the corpus gains.

The remaining work: the $-item resolvers filter to the bound record's
minted_in by default, an opt-in widens to the corpus, and the coverage
laws stay corpus-wide. The stamps this debt rests on are already on
every node.

Sweep 2026-08-12 (the first retro debt sweep): re-accepted consciously.
The trigger stands unchanged - the next form listing another record's
nodes, or the owner's next reiteration. Five inbox notes folded into
this one entry at the same retro.

Sweep 2026-08-13 (second retro debt sweep): re-accepted consciously. i8's
forms opened reference tables but none surfaced the corpus-wide list this
debt names. Trigger stands unchanged.

## Swept 2026-08-15, at i12's retro: RESCHEDULED to i15

The debt is that the resolvers do not default to the bound iteration's delta.
i15 is the database iteration — "our own reader over Obsidian Bases
compatible files" — and the resolvers are what it builds. Fixing them
elsewhere would mean touching the same code twice.

The trigger stands unchanged.

## Repayment

THE $-ITEM RESOLVERS DEFAULT TO THE BOUND RECORD'S OWN minted_in DELTA. An
explicit opt-in widens a table to the whole corpus. The coverage laws stay
corpus-wide - this debt narrows what a resolver SHOWS by default, never what
a coverage check COUNTS.

CLOSED WHEN every $-item resolver reads that default and the opt-in exists,
proven by a reference table in a fresh record showing only that record's own
nodes until the opt-in is set.

## Swept 2026-08-18, at i16's onboard-retro: RE-ACCEPTED

THE DESTINATION IS UNCHANGED AND UNREACHED. i15 still reads `status: open`,
walked as far as verification, and the resolvers it would build are unbuilt —
neither `answerStructuredQuery` nor `rankCandidateCouplings` has a lane door
(note-8a7a3030c5e9, re-checked the same day).

The trigger stands unchanged.

## Sweep 2026-08-19, at i5's retro

RE-ACCEPTED, and the trigger fired twice in one record. i5's validation gate served 24 must stories and 9 value props for a delta of five requirements, and observe-red served the whole non-test corpus. Both are this debt's exact cost. i5 minted [[raid-iss-a-gate-form-asks-the-standing-set-where-its-guidance-says-the-delta]] from the gate half before finding this entry; the two describe one repair and it should be built once.

## Swept 2026-08-19, at i9's onboard-retro: RESCHEDULED

UNMOVED. `engine/stateform.ts` line 928 and line 943 still list the whole
corpus with no delta filter. Only the promotion resolver filters on the bound
record, at lines 951 to 958. No opt-in exists.

THE DESTINATION IS STILL OPEN. i15 reads `status: open`.

ONE FACT FROM THE LAST LOOK HAS CHANGED. The structured query and the coupling
ranker are now built, at `engine/query.ts` line 45 and `engine/disposition.ts`
line 70. Neither is the resolver this debt is about.

TRIGGER RE-AFFIRMED and still fires on any form listing another record's nodes.
