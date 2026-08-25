---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-debt-demonstration-reds-are-re-asked-every-iteration
type: "[[raid]]"
kind: debt
statement: observe-red asks every non-test spec in the corpus for a red observation, including the ones the open delta never touched, so each iteration re-answers demonstrations belonging to iterations that are already closed.
owner: the owner
trigger: the next iteration that reaches observe-red, which is every iteration
status: open
looked: 2026-08-25
breaks_how_badly: abrasive
how_likely: expected
impact: observe-red refuses while any box stands open. i35 minted 2 demonstration specs and met a checklist of 15, so 13 belonged to other records and none of them had a red for THIS delta to observe. The alternative is ticking boxes on reds nobody watched, which is worse — so the walk stops until each one is either fabricated or owed.
source_refs:
  - tsp-autonomy-tiers
  - tsp-coupling-disposition
  - tsp-derivation-analysis
  - tsp-prose-inspection
  - tsp-read-back-inspection
  - tsp-record-inspection
  - tsp-two-machines
  - tsp-unattended-start
  - raid-debt-human-observed-demonstrations
  - i35-the-cloud-run-s-findings-land-the-fix-fi
last_looked: 2026-08-23
look_verdict: re-accepted
---

## Why this is not [[raid-debt-human-observed-demonstrations]]

THAT ENTRY IS ABOUT FOUR SPECS NOBODY CAN OBSERVE WITHOUT A PERSON. This one is
about the SCOPE OF THE QUESTION: a spec whose design the open delta never
touched has no red for this iteration to watch, whoever is at the terminal.

The two overlap on symptom and differ on cause, which is why the older one has
been carried for several records without shrinking.

## The same shape already has a ruling, one milestone later

M7_50_verification.md carries an owner ruling from 2026-08-15 for the CLAIMS
checklist: a spec named in the source_refs of an open debt entry arrives
PRE-FILLED as owed rather than blank, so an iteration adjudicates only what its
own delta touched.

OBSERVE-RED HAS THE SAME PROBLEM AND NO SUCH RULE. The mechanism is already
built and running one state later.

## Repayment

A non-test spec whose `minted_in` is not the open record, and whose files this
delta does not touch, arrives as `- [owed] <spec> — not touched by this delta`
rather than as a blank box. The set that stays blank is the set the iteration
actually moved.

IT IS MECHANICAL. The record id is a frontmatter field, the delta is a file list
the engine already computes, and matching one against the other is a set
operation — the same one the verification ruling already describes.

## Swept 2026-08-18, at i16's onboard-retro: RE-AFFIRMED, and it fires this iteration

THE TRIGGER IS "the next iteration that reaches observe-red, which is every
iteration". i16 is walking now and will reach it, so this is not a hypothetical
re-affirmation — the same 13 boxes will arrive blank again.

NOTHING WAS BUILT SINCE THE LAST LOOK. The repayment is a set operation the
engine already computes for the CLAIMS checklist one milestone later, and it
still has no second call site at observe-red.

The trigger stands unchanged.

## Sweep 2026-08-19, at i5's retro

RE-ACCEPTED, and the trigger fired again. i5 reached observe-red and answered the same wide checklist for a delta of five requirements. It is the same shape as [[raid-iss-a-gate-form-asks-the-standing-set-where-its-guidance-says-the-delta]], which i5 minted at its validation gate: a live source serving the standing set where the method asks for the delta. If one repair is built, it should close both.

## Swept 2026-08-19, at i9's onboard-retro: RESCHEDULED

NOTHING BUILT. `machines/rigor_matrix/rows/M7_30_observe-red.md` lines 22 to 26
still declare their items with no owed rule, and the guidance section has none.
The resolver behind them lists the whole corpus, unfiltered.

THE SIBLING RULE EXISTS ONE MILESTONE LATER, at `M7_50_verification.md` lines
78 to 92. So the mechanism this repayment calls "already computed" has exactly
one call site, and it is not this one.

TRIGGER RE-AFFIRMED, and it fires on the next iteration that reaches the step,
which is every iteration.

## Swept 2026-08-20, at the standalone retro after i37 shipped

THE TRIGGER FIRED AGAIN, as this row says it always does. i37 reached
observe-red and re-answered demonstrations belonging to closed iterations.

WHAT i37 ADDED IS ONE MEASUREMENT AND ONE HALF-FIX. `tests/checklists-stay-home.test.ts`
now pins that both halves of the observe-red evidence scope to the same record,
so the two halves can no longer disagree about which iteration they are about.

THE COST THIS ROW NAMES IS UNCHANGED. Scoping the two halves together does not
shrink the corpus either half is asked about.

RESCHEDULED, TRIGGER RE-AFFIRMED: the next iteration reaching observe-red.

