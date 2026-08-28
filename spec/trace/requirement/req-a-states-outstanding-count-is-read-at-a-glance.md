---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-states-outstanding-count-is-read-at-a-glance
type: "[[requirement]]"
statement: The system shall show a state's outstanding count in a form a person reads without opening that state.
kind: quality
characteristic: interaction-capability
verify_method: demonstration
measure: "Over the per-state counts a real record produces, a reader names a state's outstanding total within 2 seconds without opening the state. Measured 2026-08-26 over 21 signed positions: 4 to 15 work tokens each, median 5."
breaks_if_removed: The surface is laid out against a number nobody measured, and a count nobody scans is a count nobody reads.
breaks_how_badly: corrosive
refines:
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - raid-asm-a-record-s-token-count-stays-legible-on-a-surface
  - "measured: this round's own kickoff gate became fourteen pieces of work, which is one state"
priority: should
weighs_with:
  - none
weighs_against:
  - req-a-tree-that-models-work-two-ways-refuses > a count nobody can scan misleads every reader today, where two models of work is a fault only a later change would meet
  - none
---

## Scenario

- Source: the maintainer looking at a machine.
- Stimulus: they want to know how much one state still owes.
- Artifact: the machine surface.
- Environment: a real record's counts rather than an invented example.
- Response: they read the state's outstanding total off the surface.
- Response measure: within 2 seconds, without opening the state, over the
  counts a real record produces.

## Detail

THE POPULATION IS MEASURED AND THE MEASUREMENT IS PARTIAL, said plainly
because the first wording named a population that does not exist yet.

WHAT WAS COUNTED, 2026-08-26: this record's own 21 signed positions carry 136
evidence fields, between 4 and 15 each, median 5. That is one or two digits,
which is what a bubble was drawn for.

WHAT WAS NOT COUNTED. The reading each position demands was not added, and
the record is mid-walk so its build and verification positions do not exist.
The register entry stays open for that reason.

TWO SECONDS IS AN AUTHORED BAR. The population is measured; the threshold is
a choice this round makes.

RUN THE PROBE BEFORE THE SURFACE IS LAID OUT. A count that does not fit
changes the drawing rather than the plan, and running it afterwards wastes
the drawing.
