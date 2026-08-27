---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: fn-run-a-governed-walk.offer-the-work-that-is-ready
type: "[[function]]"
cluster: the-work
statement: put in front of a hand the work tokens whose predecessors have reached what they demand and whose difficulty that hand carries
satisfies:
  - req-work-says-when-a-hand-is-on-it
  - req-readiness-is-derived-from-a-declared-dependency
  - req-work-carries-how-hard-it-is
inputs:
  - flow-work-item
  - flow-step-difficulty
outputs:
  - flow-offered-work
controls:
  - the dependency edge, which decides what is withheld and until when
  - the strength of the hand asking
source_refs:
  - uc-work-a-states-work-tokens-to-completion
  - uc-walk-a-record-on-a-smaller-model
---

## Rationale

TWO FILTERS, ONE ACT. Readiness answers whether the work can be started at
all. Difficulty answers whether this hand is the one to start it. Both run
before anything is handed over, and splitting them would put half the
decision in one place and half in another.

IT IS NOT `serve-a-step`. That function answers the walk's forward verb and
decides whether the next position opens. This one decides which of the
work tokens at the current position are takeable now. The first is about the
machine, the second about the work standing in it.

IT IS NOT `offer-what-may-be-taken-up` EITHER. That function shows a person
every standing option so they can decide what to do next. This one hands a
working hand what it can act on immediately, and it withholds rather than
displays.

READINESS IS DERIVED WHEREVER AN EDGE WAS WRITTEN and assumed everywhere
else. Most work tokens carry no predecessor, so the filter is cheap in the
ordinary case.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? Yes. A graph walked on
every ask, a ready-list maintained as statuses change, or a query run against
whatever holds the work tokens. The statement names none of them.

## Addition — taking work is when the mark goes on

THE OFFER IS HALF THE ACT AND TAKING IT IS THE OTHER HALF. A hand that starts
on a piece of work says so on the work, before it acts, and that mark is what
the progress account is derived from.

IT SITS HERE RATHER THAN ON SETTLING, because settling is the end and this is
the beginning. A mark that went on at the end would report every piece of work
as having started at the moment it finished.
