---
unreachable_refs:
  - cand-explicit-and-safe
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-dec-i15-disposition-prepopulates-pending-rows
type: "[[raid]]"
kind: decision
statement: record-a-coupling-disposition writes one disposition row per ranked candidate, stamped pending, before any person looks at it — no threshold, no auto-classified band.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-wrong-act-never-passes-silently
  - opt-prepopulate-pending-disposition-rows
  - cand-explicit-and-safe
---

## Rejected options

- Probabilistic threshold classification (opt-probabilistic-threshold-classification, cand-continue-v1s-shape's choice) — scored 1/5 on req-a-wrong-act-never-passes-silently at evaluate-set: a miscalibrated threshold silently misclassifies a real coupling with nobody positioned to catch it, which is exactly the fatal-graded failure mode this row exists to prevent.
- Blocking near-duplicate candidates (opt-block-candidates-before-individual-review, the disposition half of cand-fast-path-plus-blocking) — real, and the reverse-sensitivity hunt found it one credible fix away (a wrongly-blocked candidate's escape hatch) from tying the winner; not chosen because that fix is not yet built.
- Ensemble ranking agreement (opt-ensemble-ranking-agreement-required), on-demand binary confirm (opt-on-demand-binary-confirm-no-ranked-batch), agent-judgment ranking (opt-agent-judgment-ranking-instead-of-lexical-score), and hard-cap ranked list length (opt-hard-cap-ranked-list-length) — recorded in full on the option nodes each names; none reached the front.

## Consequences

No candidate coupling is ever silently disposed of by the engine's own say-so — every one gets a visible pending row a person must clear. The cost is that review load scales linearly with candidate volume, unbounded, and nothing in this decision enforces that a person actually clears the queue in a timely way (raid-note carried at declare-winner). If candidate volume outgrows manual review, opt-block-candidates-before-individual-review is the design already standing ready to reopen this decision.
