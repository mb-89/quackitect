---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-a-breached-bound-is-put-in-front-of-a-reviewer
type: "[[requirement]]"
statement: When a gate reviews a milestone, the engine shall present every instrumented interface whose measured answer exceeded its bound since the last review, for every gate.
kind: functional
verify_method: test
breaks_if_removed: The measurement exists and nobody is obliged to look at it, so a breach is found by whoever happens to be annoyed that day rather than by the process.
breaks_how_badly: corrosive
refines:
  - uc-drive-the-machine-at-the-pace-of-thought
source_refs:
  - uc-drive-the-machine-at-the-pace-of-thought ext 5a
  - "i33 gate-kickoff round_2_red_team: if milestone three ends with no state reading the instrument then this iteration has repeated i12"
priority: must
---

## Scenario

- Source: the engine's own call log and its timing records.
- Stimulus: a gate is reviewed.
- Artifact: the gate's evidence form.
- Environment: normal operation.
- Response: the interfaces that breached their bound since the last review are
  presented to whoever fills the form.
- Response measure: every breach in that window appears; a gate reviewed with
  breaches standing cannot be filled without them being shown.

## Why this row exists and why it is a MUST

MEASURING WITHOUT AN OBLIGED READER IS THE FAILURE THIS ITERATION IS REPEATING.

i12 shipped the one-second rule on 2026-08-15. Two days later 1834 of 8424
calls were over the bound. The rule was written, the timings were recorded, and
nothing in the machine ever put the number in front of anybody.

SO THE INSTRUMENT IS NOT THE DELIVERABLE. A reader who owes an answer is. This
row is what turns milestone three from "we can measure it" into "somebody has
to look".

IT WAS MISSING UNTIL THE REDO (2026-08-17). The register closed design input
with five rows, all about a surface being honest, and not one obliging anybody
to read a number. The kickoff's own red team had already written down that this
exact outcome would mean the iteration failed. The goals check at this gate is
what surfaced it while design input could still be changed.
