---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: opt-a-second-surface-is-made-unrepresentable
type: "[[option]]"
statement: exactly one function may emit a widget, and a check refuses any other module that does, so a second surface cannot be written rather than merely being discouraged
cluster: the-account
question: what stops a second surface being written
found_by: heuristic
source: make the illegal unrepresentable, not merely checked — held against the-account
---

## Mechanism

ONE EXPORTED ENTRY POINT EMITS EVERY WIDGET. Nothing else in the tree is
allowed to produce surface markup.

A CHECK ENFORCES IT rather than a convention. A module that emits markup and
is not that entry point is a refusal, named and remedied like any other.

THE SECOND SURFACE THEN CANNOT BE WRITTEN. Not "should not": the write is
refused, at the moment it is made, by the same machinery that refuses a bad
path or a missing field.

## Why the heuristic points here

THE RULE IS "make the illegal unrepresentable, not merely checked", and this
project has just measured what merely-discouraged costs. Two surfaces grew
side by side over months, and nothing objected, because nothing could.

THE FAILURE WAS NOT A BAD DECISION. Nobody decided to build a second surface.
It accreted, one reasonable commit at a time, which is exactly the failure
mode a structural guard exists to stop.

## What it buys

IT SURVIVES THE PEOPLE WHO KNOW WHY. A convention lasts as long as the person
who remembers it. A refusal lasts as long as the code.

IT MAKES THE COLLAPSE STICK. Every other option here removes today's second
surface. This one is the only one that stops tomorrow's.

## What it costs

A GUARD THAT IS TOO TIGHT BLOCKS LEGITIMATE WORK. A test fixture, a one-off
diagnostic page and a vendored component all emit markup and none of them is
a second surface.

THE ESCAPE HATCH IS THEREFORE PART OF THE DESIGN, not an afterthought, and a
hatch nobody can find is the same as no hatch.

## Not established

WHERE THE LINE ACTUALLY FALLS. "Emits a widget" is easy to say and hard to
detect. Nobody has written the rule precisely enough to know whether it can
be checked at all, and a guard that cannot be checked is a convention with
extra words.
