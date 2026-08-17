---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: tsp-a-repeatable-answer-earns-its-trust
type: "[[test-spec]]"
statement: "An engineer re-runs the agent's own search and gets the same rows back, so the answer is trusted because it is repeatable rather than because the agent sounded sure — verified by demonstration."
method: "demonstration"
demonstrates:
  - "sty-trust-a-repeatable-answer"
verifies: []
files:
  - "none — the procedure below is the definition; the observed run is the evidence"
---

## Scope

Whether a person other than the agent can reproduce the search behind an answer.

WHY DEMONSTRATION. The claim is about TRUST, which is a property of the person
reading the answer. No assertion inside the suite can hold it.

## Procedure

1. Ask the driving agent why something was built the way it was.
2. Ask it to show the query it ran, not a paraphrase of what it found.
3. Run that same query yourself.
4. Compare the rows.

## Pass lines

- Step 2 produces something re-runnable. A description of a search fails this.
- Step 4 returns the same rows, for anybody, on any run.

## What was observed on 2026-08-17

PARTIALLY, AND THE PARTIAL IS THE POINT. Step 2 is already possible through a
different door: every lane call is logged raw to .se/calls.jsonl, se_file_search
records a stated intent with each query, and se_log_query serves any call's full
output back by reference. i35 used the last of these repeatedly rather than
paraphrasing run output.

STEP 4 CANNOT BE MET TODAY. A grep's completeness depends on the words chosen, so
re-running it reproduces the same LUCK rather than the same COVERAGE.

MEASURED NEGATIVE FROM THIS RUN: two of i35's read-probe answers failed because a
quoted anchor crossed a line break — the same vocabulary-dependence, in the one
place the system does demand exact text.
