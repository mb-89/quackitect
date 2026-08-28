---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: fn-run-a-governed-walk.mint-what-a-state-owes
type: "[[function]]"
cluster: the-work
statement: derive the work tokens a position carries, one per thing it demands, and match them again on a later entry rather than remaking them
satisfies:
  - req-a-card-says-which-of-its-parts-are-work
  - req-re-entering-a-state-decides-what-its-work-does
  - req-a-step-that-would-seed-a-submachine-takes-work-instead
  - req-a-hand-may-break-work-into-parts-and-the-parts-are-visible
  - req-every-piece-of-work-is-one-addressable-item
  - req-a-state-mints-its-work-tokens-on-entry
  - req-a-method-step-becomes-exactly-one-work-token
  - req-a-work-token-survives-its-methods-rewording
  - req-a-surface-silence-is-answered-in-the-record
inputs:
  - flow-position
  - flow-compiled-machine
  - flow-method-sources
outputs:
  - flow-work-item
controls:
  - the reading already proven, which is subtracted before anything is minted
  - the identity of a method's marked step, which decides matching over remaking
source_refs:
  - uc-work-a-states-work-tokens-to-completion
  - raid-risk-a-state-must-mint-its-own-tokens-and-that-machinery-is-undesigned
---

## Rationale

DERIVING WHAT IS OWED IS A DIFFERENT ACT FROM CHECKING WHAT CAME BACK.
`judge-a-claim` builds a form and judges the answer. This function decides
what there is to answer in the first place, and today nothing does it: the
work tokens are authored twice, once as evidence fields and once as steps in
a method card, with nothing reconciling the two.

IT SITS ON THE HOT PATH OF EVERY ENTRY into every position, which is why it
stands alone rather than folded into serving. A cost here is paid by every
hop.

THE IDENTITY IS THE FUNCTION'S OWN OUTPUT. A thing that can be pointed at,
moved and counted has to be given an identity by something, and this is the
act that gives it one. That is why the addressable-item demand sits here
rather than on a function that later moves or counts it.

RE-ENTRY IS THE HARD HALF. A first entry is arithmetic. A second entry, after
the method card was reworded, is a matching problem, and getting it wrong
either orphans finished work or mints a duplicate beside it.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? Yes, and at least three
ways: computing the set on every entry, storing it and diffing, or deriving
it lazily as each work token is asked for. The statement names none of them.

## Addition — what a second entry and a larger job add

RE-ENTRY IS FOUR CASES RATHER THAN ONE, and this function decides between
them: unfinished keeps its temporary work, finished is walked through,
reopened remakes the temporary work and reopens the lasting, and a late drop
onto a running state is accepted rather than refused.

A STEP THAT WOULD HAVE SEEDED A MACHINE BENEATH IT mints work instead. That
is the same act at a different grain, which is why it sits here rather than
becoming a function of its own.

A HAND MAY MINT TOO. Work larger than its mark says gets parts beneath it,
created by the hand working it rather than by the entry. The act is the same
and only the trigger differs.

AN OPEN QUESTION IN THE REGISTER IS ALSO SOMETHING A STATE OWES. Where a
state's evidence rests on a surface whose drawing has not answered a question,
the standing register entry is minted onto that state as work like any other.

IT MOVED HERE FROM KEEPING THE RECORD after a second cold review. The demand
used to be that somebody write a ruling down, which is a demand on a person
rather than on the system. What the system owes is deriving the work token, and
that is this act.
