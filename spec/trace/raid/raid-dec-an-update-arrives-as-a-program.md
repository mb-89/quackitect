---
unreachable_refs:
  - cand-the-program-route
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-an-update-arrives-as-a-program
type: "[[raid]]"
kind: decision
statement: Upstream's later work reaches a copy as a program that transforms whatever the copy now holds, never as content the copy must merge.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
impact: "This is the choice the whole line is built on. Wrong, the copy is back to the forced choice every other vendoring system makes: hold a reference you cannot edit and receive updates, or hold a copy you own and never receive another."
source_refs:
  - req-overlay-survives-update
  - opt-the-update-arrives-as-a-program
  - cand-the-program-route
  - raid-tripwire-i16-a-structural-migration-cannot-be-written
  - iterations/i16 evidence find_by_probing
---

## The choice

A PROGRAM SAYS WHAT TO CHANGE AND NEVER WHERE. That is the whole mechanism.
Because it never refers to a position, it is indifferent to how the copy has
restructured the file it is changing.

A DIFF SAYS WHERE. A copy that reordered a file's sections presents to a
line-based merge as delete-everything plus insert-everything, so an upstream
change to a line the copy never touched still conflicts.

## Why this rather than the obvious thing

ROUGHLY A HUNDRED PRODUCTS WERE READ AND EVERY OTHER ONE FORCES THE CHOICE.
Hold a reference you cannot edit and receive updates, or hold a copy you own and
never receive another. Codemods are the single exception in the whole survey,
and this decision is built on them.

IT REFUSES THE CHOICE BY SEPARATING IN TIME. The copy owns everything, always.
Upstream's knowledge arrives later, as an act rather than as content.

## What the evidence actually shows, and what it does not

MEASURED: the diff route conflicts. The run printed `merge exit: 1` with
`upstream change landed: True` and `copy's own edit kept: True`, on a copy that
had only reordered sections. Both versions present and marked, so the cost is
one human resolution per restructured file rather than lost work.

DEMONSTRATED, NOT MEASURED: the program route applying cleanly. That arm was a
text substitution checked for its own effect, with no repository, no merge and
no failure mode available to it. It shows the mechanism. It does not test it.

AND THE HARD HALF IS UNTESTED. A migration that must understand structure
rather than match text is exactly what the probe faked.
[[raid-tripwire-i16-a-structural-migration-cannot-be-written]] carries the
trigger and the fallback.

## Rejected options

THE VENDORED SOURCE IS ONE MORE REFERENCE, refreshed on the cycle that already
refreshes references. REJECTED as this cell's answer and it should be taken
anyway on the row beside it: it supplies a moment and an address, which this
decision does not, and it is the only mechanism in the set that can express
pulling from a source that is not this copy's ancestor. It is not a transport
for upstream's WORK, which is what this row asks.

THE SOURCE IS ONE FACT IN THE COPY, an origin recorded where the name already
lives. REJECTED as insufficient alone: it says where to look and nothing about
what arrives or how it lands. Cheap enough that it should be added regardless.

A CHANGED COPY OWES A PROPOSAL BACK. REJECTED because it is a duty rather than
a transport. It says what the copy owes when a fix arrives and never says how
the fix arrives, when it is asked for, or from where.

TAKE NO UPDATES AT ALL. REJECTED on an owner ruling: the copy is to be able to
pull engine updates from its source.

## Consequences

SOMEBODY UPSTREAM HAND-WRITES A MIGRATION FOR EVERY BREAKING CHANGE, FOREVER.
That is a permanent tax on making changes at all, and it is why the mechanism is
rare rather than obvious. A source that stops writing migrations does not
degrade gracefully; it silently stops delivering and no copy learns.

UPDATES MUST BE TAKEN IN ORDER, one version span at a time. A copy that skips
several cannot catch up in one step.

THE DIFF IS LEFT UNSTAGED FOR A PERSON. The mechanism does not claim the result
is right, and a migration that runs, succeeds and produces something wrong has
no other signal. That sits against
[[req-a-wrong-act-never-passes-silently]] and it is the failure mode that
decides this line.

AND THE INVENTORY THIS PRODUCES CARRIES NO REASONS. It is recomputed from the
merge each time, so it can never be false and can never say why. Nothing in the
field does both, and the design that does the other half lost by one cell.
