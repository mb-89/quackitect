---
minted_in: i3
id: raid-iss-minor-lost-its-looking-places
type: "[[raid]]"
kind: issue
statement: Twelve steps were struck from the minor column on 2026-08-13. Each was also a moment where somebody looked at the boundary, the stakeholders, the architecture or the unknowns, and could notice the iteration was really a major. Nothing has tested whether the escalation rules written in their place replace that.
owner: the owner
trigger: the first minor iteration that has to escalate mid-walk
status: open
impact: An under-sized iteration walks to the build before anybody notices. The cheap places to catch it are gone, so it is caught at the implementation gate or later, where the correction costs the whole build.
breaks_how_badly: corrosive
how_likely: plausible
probe: "unprobed by construction — it needs a real minor that should have been a major, and none has been walked since the strike."
probed: 2026-08-13
source_refs:
  - "machines/rigor_matrix/rows/M2_10A_draw-context.md, minor_note — the escalation rule that replaces the state"
  - "machines/rigor_matrix/rows/M5_90_gate-architecture.md, minor_note"
  - "tests/rigor-matrix.test.ts, the twelve struck rows named"
  - "the owner's ruling 2026-08-13, taken milestone by milestone"
---

## The claim

The minor column lost twelve states on 2026-08-13: define-actual, draw-context,
map-stakeholders, gate-inputs, record-adrs, evaluate-architecture,
gate-architecture, the whole of M6, and run-demos.

Every one of them replaced its questions with an escalation rule in prose.
"A new neighbour IS the boundary moving. Promote the iteration to major."

The rule sits in the row. At minor the state is gone, so nobody reads the row.

## Why it is an issue and not a risk

A risk is something that might happen. This already happened, in the sense
that the states are gone today and the replacement is untested today.

What is uncertain is only the consequence.

## The argument FOR the strike, which is not weak

A state whose only honest answer is "unchanged" gets answered "unchanged"
without looking. That teaches the walker that a form can be satisfied without
looking, and the habit then costs at the states that matter.

The owner made this argument, and it survived the disconfirming question:
asked what those states actually produced at minor, the answer was a pointer.

## The argument AGAINST, which is also not weak

Twelve cheap looks are still twelve looks. The escalation now depends on the
walker noticing, unprompted, in a state that is not about the thing they must
notice.

decompose-structure is the one surviving place with an explicit escalation
duty. It carries the whole load that M2 and M5 used to share.

## Probe

The first minor that escalates. Record two things:

- What surfaced it.
- At which state.

If it surfaced at decompose-structure or the requirements gate, the strike
holds. If it surfaced at the implementation gate or later, the strike cost
more than it saved and one of the twelve comes back.
