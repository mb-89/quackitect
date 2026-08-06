---
id: req-audit-answers-from-log
type: "[[requirement]]"
statement: "The engine shall answer the retro's declared counts from the recorded log alone."
kind: quality
verify_method: test
breaks_if_removed: "The retro guesses its counts and drifts from what actually ran."
refines:
  - uc-stay-auditable
source_refs:
  - uc-stay-auditable step 4
  - ".se/req-mine-v2.md: logging, observability and the retro (v2-068, v2-070)"
priority: could
---

## Scenario

- source: the person answerable for the work
- stimulus: an accountability question about a period of agent work
- artifact: the raw call log
- environment: after the fact, with no session alive to ask
- response: the question resolves as an aggregation over the recorded lines
- response measure: declared retro counts answerable from the log alone = every one; counts needing a live session = 0
