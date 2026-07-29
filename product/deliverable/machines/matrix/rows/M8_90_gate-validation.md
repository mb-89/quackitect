---
kind: matrix-row
name: gate-validation
statement: "GATE validation: meets the need - and this bless IS the sign-off."
state_kind: gate
filled_by: agent
depends_on: [fill-story-evidence, sweep-consistency, log-gaps]
---

## Guidance

Review per [[meth-gate-review]]. The bless is the acceptance act: hash-bound, channel-recorded - no second sign-off artifact. Market iterations only: the expensive real-world tier is mandatory before this gate.

## Evidence form

- meets_need | (killer) every need's pass lines demonstrated, all iterations | required
- killers_demonstrated | each killer use case exercised end to end | required
- acceptance_converted | executable slices now permanent acceptance scenarios, or reasons | required
- consistency_swept | the surfaces agree with the behavior | required
- gaps_logged | validation gaps in RAID | required
- market_tier | (market) the real-world checks green - required only when the iteration is declared to market | optional
