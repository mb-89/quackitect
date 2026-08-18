---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-debt-demonstration-reds-are-re-asked-every-iteration
type: "[[raid]]"
kind: debt
statement: observe-red asks every non-test spec in the corpus for a red observation, including the ones the open delta never touched, so each iteration re-answers demonstrations belonging to iterations that are already closed.
owner: the owner
trigger: the next iteration that reaches observe-red, which is every iteration
status: open
looked: 2026-08-18
breaks_how_badly: abrasive
how_likely: certain
impact: "observe-red refuses while any box stands open. i35 minted 2 demonstration specs and met a checklist of 15, so 13 belonged to other records and none of them had a red for THIS delta to observe. The alternative is ticking boxes on reds nobody watched, which is worse — so the walk stops until each one is either fabricated or owed."
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
