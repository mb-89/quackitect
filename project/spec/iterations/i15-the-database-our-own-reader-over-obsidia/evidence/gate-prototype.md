---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-16T18:37:52.268Z
authors: agent
files:
---

# Evidence form / gate-prototype

## current_situation

gate-prototype reviews i15's one seeded spike before M7 build starts. The spike (exp-i15-query-latency-at-real-corpus-scale) has already run and folded back.

## buildable

yes — the seeded spike holds with a 32x margin under the one-second bound; nothing else blocks build.

## round_0_verify

- evidence vs claims: the exp- node's measured (31 ms, 768 files) matches what the register entry now carries — claim and evidence agree
- types: no product code changed this milestone (spec/markdown only, pre-M7) — nothing to typecheck yet
- lint: same — no code shipped yet, nothing to lint
- tests: none run — the spike's script was throwaway and unshipped, no test file exists to run

## round_1_validate

- exercised against the goal: the spike tested exactly req-call-answers-in-one-second at real scale, which is M6's whole purpose — derisk before committing to build
- missing: nothing else was seeded; rank-unknowns explicitly excluded the design-gap risk and the two losing-candidate tripwires, with its reasoning on record in evidence/rank-unknowns.md
- wrong: no finding contradicts a standing claim — the measurement confirmed the design assumption rather than overturning it
- out of scope: the real filters.and/or evaluator is out of scope for a spike; that is named M7 build work on the experiment node's promote field
- prior art: none newly needed — the M4 prior-art scan already covered the query mechanism's design space

## round_2_red_team

- the corpus measured (768 files) doubles the ~328 everyone had been assuming, and the 32x margin still held, so scale is not the weak point here. => not a live risk
- the weakest remaining point is raid-risk-i15-broken-trace-defect-unaddressed-by-any-candidate, which stays open — no spike settles a design gap, M7 build work does. => carried forward, not blocking this gate

## raid_additions

- none

## verdict

pass — the one seeded spike holds with a 32x margin, and no assumption stands unprobed that a spike could have settled

## follow_up

none — proceeds to M7 build (specify-build).

## anything_else

