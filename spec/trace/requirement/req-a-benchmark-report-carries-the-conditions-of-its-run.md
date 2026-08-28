---
minted_in: i37-training-iterations-a-disposable-iterati
id: req-a-benchmark-report-carries-the-conditions-of-its-run
type: "[[requirement]]"
statement: "The engine shall refuse to record a benchmark report that omits any of its conditions: the iteration, the rewind commit, the change size, the rigor matrix hash, the se version, the harness, the model and the reasoning effort."
kind: quality
verify_method: test
fitness_candidate: true
breaks_if_removed: A number without its conditions cannot be re-tested or paired, so the whole ledger becomes anecdote.
breaks_how_badly: crippling
refines:
  - uc-measure-a-machine-change-against-a-finished-iteration
source_refs:
  - uc-measure-a-machine-change-against-a-finished-iteration step 6
  - vp-rigor-without-toil, the third metric of the criterion added by i37
  - i36-the-harness-is-not-claude-measure-what-e
weighs_with: none
weighs_against:
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound >
priority: must
---

## Scenario

- source: a benchmark run reaching its stop point
- stimulus: the run fills its report
- artifact: the benchmark-run item template and its checks
- environment: any host, any model
- response: a report missing a condition refuses at submit and names the missing field
- response measure: recorded reports missing any condition = 0
