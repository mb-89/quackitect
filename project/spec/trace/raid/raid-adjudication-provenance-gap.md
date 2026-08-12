---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: raid-adjudication-provenance-gap
type: "[[raid]]"
kind: assumption
statement: No vendor ships adjudication provenance, so the middle ground between design input and architecture stays unoccupied.
owner: the owner
trigger: none — closed, and nothing brings it back
status: closed
impact: None. The concern it named is not one this product carries.
breaks_how_badly: cosmetic
how_likely: conceivable
source_refs:
  - the gap claim in frame-delta
  - meth-state-of-the-art
---

CLOSED BY OWNER RULING, 2026-08-07. Kept rather than deleted so nobody
re-derives it in six months.

## Why it is closed

The entry assumed the product needs to record WHO judged a decision, on what
evidence, at what rigor — and that no vendor offers that, leaving a gap worth
occupying.

The owner ruled the premise away rather than the fact:

> The person responsible for the commit is the person who commits it. We know
> via git who committed it. We don't push responsibility to the agent ever. No
> matter what the agent does, the human who pushes is responsible for the
> change.

So responsibility is already settled, by git, at the only moment it matters.
Finer-grained identification of who adjudicated what is not wanted, and a gap
in something we do not want is not a gap.

## What this does NOT close

The frame-delta's claim about the middle ground stands on its own feet — that
nobody couples forced design input, an encoded method and a governed agent on
one record. That claim was tested by the red team at gate-motivation and came
out narrower and stronger. It never depended on this entry.

What went is only the provenance-of-judgment part, and it went because the
product does not want it.

## Probe

NONE, AND NONE WILL BE RUN. The section stays because the entry is still an
assumption by kind, and an assumption says how it would be checked.

The old probe asked for a sweep of vendor release notes, looking for an
adjudication surface. It is struck. There is no point probing something
nobody is relying on.

Re-opening this entry would mean reversing the owner's ruling first. The
probe would follow from that, not the other way round.
