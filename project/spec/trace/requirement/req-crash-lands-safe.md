---
minted_in: i1
id: req-crash-lands-safe
type: "[[requirement]]"
statement: If the channel holding a live offer falls silent, then the engine shall collapse the offer to the dismissed state with zero grants recorded.
kind: quality
fitness_candidate: true
verify_method: test
breaks_if_removed: A silent break leaves a phantom offer standing, and a grant can land on work nobody is watching.
breaks_how_badly: crippling
refines:
  - uc-quality-reliability
source_refs:
  - uc-quality-reliability ext 4a
  - ".se/req-mine-v2.md: gates, offers and grants (v2-019, v2-032)"
priority: must
---

## Scenario

- source: any break: a crash, a reclaimed VM, a dropped connection, a person's interrupt, a timeout
- stimulus: the channel holding a live offer goes silent
- artifact: the live offer and the grant chain
- environment: an offer stands unanswered and no liveness signal exists
- response: the offer collapses to the dismissed state, the same state an explicit dismissal reaches
- response measure: grants recorded from silence = 0; distinct end states across break kinds = 1 (dismissed)
