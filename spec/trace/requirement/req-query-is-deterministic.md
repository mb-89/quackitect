---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-query-is-deterministic
type: "[[requirement]]"
statement: While the corpus has not changed between two calls, the query verb shall return identical rows for identical requests.
kind: quality
characteristic: reliability
verify_method: test
breaks_if_removed: An engineer cannot trust an agent's answer to why something was decided, because re-running the same query might return different rows; the engineer keeps re-verifying by hand, exactly the toil this iteration exists to remove.
breaks_how_badly: corrosive
refines:
  - uc-query-the-corpus-by-structure
  - uc-get-a-trustworthy-answer
source_refs:
  - uc-get-a-trustworthy-answer step 5
priority: should
weighs_against:
  - req-a-windowed-pool-answer-says-that-it-was-windowed > — an answer that changes under you cannot be trusted at all; a windowed answer that says so is trustworthy and merely partial
---

## Scenario

- Source: an engineer, through the driving agent.
- Stimulus: the same query (kind, filter, requested fields) is run twice.
- Artifact: the query verb.
- Environment: no write lands on the corpus between the two calls.
- Response: the second call's rows match the first call's rows.
- Measure: 100% of the requested fields identical, on every row, across the two calls.
