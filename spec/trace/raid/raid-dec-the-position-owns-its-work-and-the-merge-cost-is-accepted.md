---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-the-position-owns-its-work-and-the-merge-cost-is-accepted
type: "[[raid]]"
kind: decision
statement: A position holds the work it owes, rather than a piece of work naming the positions it serves. The merge cost that direction carries is accepted rather than designed away.
owner: the owner
trigger: the first time two hands work one record from separate clones, and any report that a merge needed a person to resolve work content
status: decided
impact: It settles which end of the relation is authoritative, so every reader of what a position owes is written once. It also accepts a cost nothing has measured, on the only axis where a rejected candidate reached prior-art par.
breaks_how_badly: corrosive
how_likely: plausible
weighs_with: none
weighs_against: req-two-hands-writing-work-at-once-do-not-collide
source_refs:
  - cand-the-work-holds-the-position
  - req-two-hands-writing-work-at-once-do-not-collide
  - opt-the-work-names-what-it-blocks-rather-than-a-position-listing-its-work
  - "scored 2026-08-26: Inverted 4 against the winner's 2 on non-colliding writes, the only prior-art par any rival held"
  - "prior art 2026-08-26: git-bug stores each issue as its own object with no shared index, which is why two clones merge cleanly"
---

## What it settles

WHICH END OF THE RELATION IS AUTHORITATIVE. The position owns the work.

THE ALTERNATIVE WAS REAL AND IT SCORED HIGHER ON ONE THING. A design where the
work names the positions it serves needs no list on any position, so two hands
adding work touch disjoint bytes and never collide.

## Why it was refused

BECAUSE IT IS NOT A GRAFT. Inverting the relation is the whole of what the
rejected candidate was, so taking it does not improve the winner — it replaces
the winner with the rival plus a fold.

THE REVERSE-SENSITIVITY RUN SAID THE SAME THING FIRST, before the winner was
declared: this is the one strength the leader cannot write its way to, because
it is a relation shape rather than a document.

WHAT INVERTING WOULD ALSO COST. The rejected candidate scores 1 where the winner
scores 3 on naming every place work is modelled, because inverting spreads the
modelling furthest. The merge property is bought with legibility.

## What the acceptance actually accepts

A COST NOBODY HAS MEASURED. One hand walks this system today, so nothing has
collided yet, and the candidate that wins records no cost for the merge surface
at all.

TWO SHIPPED TRACKERS REFUSED THIS DIRECTION for exactly this reason and each
wrote down why. That is the strongest evidence against this decision and it
belongs in the same breath as the decision.

THE COST ARRIVES WITH THE SECOND HAND, not gradually. A demand nobody is
currently failing looks like a demand nobody has, which is why this is a
decision rather than an oversight.

## Rejected options

- INVERT THE RELATION. Rejected because it is the rival rather than a graft, and
  because it costs the modelled-places legibility the winner holds. Its merge
  property is the best single cell any losing candidate scored.
- REPLAY AN APPEND-ONLY CHANGE LOG, which is Fossil's answer and commutes under
  concurrent writes. On the chart as an option, never composed, because it makes
  work unreadable without the system that replays it — a standing fatal demand.
- KEEP A LOCK. Not on the chart and rejected here on sight: a lock makes
  concurrent work refuse rather than merge, which answers the row by preventing
  the scenario rather than surviving it.

## Consequences

- THE MERGE SURFACE IS ACCEPTED AND UNMEASURED. Nothing on the board prices it,
  and the winner scores 2 where a rejected design scores 4.
- ONE GRAFT MADE IT WORSE. Rewriting 37 citations across 49 files at fold time
  is a tree-wide write with a blast radius past the record being closed, and it
  is a second uncosted merge surface.
- THE PROBE IS OWED BEFORE A SECOND HAND ARRIVES. Two writers adding work to one
  position from separate clones, and whether both changes land.
- IF IT FAILS, THE FIX IS THE REJECTED CANDIDATE. That is worth knowing now:
  this decision's failure mode has a known answer that this round already
  composed and scored.

## What falsifies it

A MERGE THAT NEEDS A PERSON TO RESOLVE WORK CONTENT. The requirement's own
response measure is zero of them.
