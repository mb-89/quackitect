---
minted_in: i2
id: raid-debt-delta-default-views
type: "[[raid]]"
kind: debt
statement: The reference views still list the whole corpus - the minted_in stamps stand, but the resolvers do not yet default to the bound record's delta with the corpus opt-in.
owner: the driving agent
trigger: a record opens whose scope names the reference resolvers themselves — the old wording fired on the next form opened, which is every form of every round, and forty-two rounds have passed without it collecting anything
status: open
looked: 2026-08-28
breaks_how_badly: abrasive
how_likely: expected
impact: Every reference table in a record lists the standing corpus beside the delta - 38 test-specs where 7 are the iteration's own - and the reader wades through history, exactly what the owner has flagged three times.
source_refs:
  - req-nodes-scoped-to-iteration
  - note-db7c72bd519c
last_looked: 2026-08-26
look_verdict: re-accepted
place: i53-a-step-sees-its-own-record-s-slice-forms
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

## Repayment landed 2026-08-19, at i15's fix-delta-default-resolvers chunk

FOUR RESOLVERS NOW DEFAULT TO THE BOUND RECORD'S OWN minted_in, WITH AN
EXPLICIT `:all` OPT-IN: $experiments, $requirements, $test-specs,
$design-specs, $value-props (all through typedItems), $claim-specs, and
$must-stories. $promotions is fixed too, but differently — its own owner
derivation (`basename(traceRoot)`) never actually matched under the current
one-tree-one-path ADR, so it silently stayed corpus-wide since the day it
was written; the owner now comes from the bound evidence folder instead,
the same source every other fix here uses.

Proven by node-scoping.test.ts's "the delta-default view": two records'
worth of requirement nodes, a bound evidence folder, and three cases — the
bare source shows only the bound record's own node, `:all` shows both, and
with nothing bound the legacy corpus-wide behaviour is untouched.

SEVEN RESOLVERS ARE DELIBERATELY LEFT CORPUS-WIDE: $functions, $clusters,
$flows, $options, $candidates, $criterion_pool, $compounding_suspects, and
$assumptions. These model something that spans records — an architecture,
a candidate pool, a comparison in progress — not a per-record history list.
Scoping them to minted_in risks hiding the very options a walk needs to
place a new node against (a function belongs in an existing cluster another
record minted; a candidate is compared against options nobody in this
record proposed). Narrowing them needs a design pass this chunk did not do,
not a mechanical repeat of the typedItems fix.

STATUS STAYS OPEN. The debt's own closure bar ("every $-item resolver")
is not fully met — eight of fifteen source names are fixed, covering the
debt's own worked example (test-specs) exactly. The remaining seven are a
named, reasoned follow-up, not a silent gap.
## Swept 2026-08-19, at i9's onboard-retro: RESCHEDULED

UNMOVED. `engine/stateform.ts` line 928 and line 943 still list the whole
corpus with no delta filter. Only the promotion resolver filters on the bound
record, at lines 951 to 958. No opt-in exists.

THE DESTINATION IS STILL OPEN. i15 reads `status: open`.

ONE FACT FROM THE LAST LOOK HAS CHANGED. The structured query and the coupling
ranker are now built, at `engine/query.ts` line 45 and `engine/disposition.ts`
line 70. Neither is the resolver this debt is about.

TRIGGER RE-AFFIRMED and still fires on any form listing another record's nodes.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.

## Swept 2026-08-26, at i54's closing retro: RE-ACCEPTED

NOT MEASURED THIS WINDOW. i54's gates were filled and blessed, and no count of what each form served was taken, so this look cannot say whether the trigger fired.

SAYING THAT IS THE POINT. An unmeasured window is not a quiet one, and recording it as quiet would be the lie this whole sweep exists to prevent.

RE-ACCEPTED consciously, trigger unchanged.


SWEPT 2026-08-28, at i63's closing retro: TRIGGER FIRED, AND STILL NOT
MEASURED.

It fires on the next form opened in a record whose table lists another record's
nodes. i63 walked ten gates and about ninety forms in this window, so the
moment arrived many times over.

WHAT THIS ENTRY SAID OF ITSELF ON 2026-08-26 was that the window went
unmeasured, and that an unmeasured window is not a quiet one. That is true
again here, and saying it twice is the finding rather than the excuse.

RESCHEDULED, and it now needs a measurement rather than another look. Somebody
has to open one gate form and count how many of its rows belong to another
record.
