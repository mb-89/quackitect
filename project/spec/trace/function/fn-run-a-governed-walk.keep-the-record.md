---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: fn-run-a-governed-walk.keep-the-record
type: "[[function]]"
cluster: the-account
statement: record every act and every claim so the reasoning can be reconstructed without asking anybody
satisfies:
  - req-every-call-logged
  - req-acts-carry-role-and-channel
  - req-roles-never-usernames
  - req-audit-answers-from-log
  - req-repo-search-carries-intent
  - req-outbound-query-logged
  - req-answer-recorded-with-question
  - req-upward-links-live-in-the-file
  - req-broken-trace-is-a-defect
  - req-every-artifact-is-readable-text
  - req-narration-toll-is-collected
  - req-nodes-scoped-to-iteration
  - req-trace-source-never-mixes
  - req-trace-view-derived-from-files
  - req-story-links-its-proving-run
  - req-finding-lands-as-reference
  - req-finding-keeps-its-sources
  - req-no-claim-without-evidence
  - req-comparison-carries-both-sides
  - req-vendor-page-claim-only
  - req-missing-provider-named
  - req-no-agent-act-destroys-work
inputs:
  - flow-resolved-target
  - flow-dispatched-call
  - flow-stamped-claim
  - flow-outside-result
  - flow-choice
  - flow-findings-report
  - flow-sweep-result
  - flow-divergence-report
outputs:
  - flow-call-log
  - flow-trace-graph
  - flow-reference-corpus
controls:
  - the fixed role vocabulary
  - the rule that a claim carries its sources
source_refs:
  - uc-quality-maintainability
  - uc-trace-a-decision-to-its-origin
  - uc-research-and-record-an-answer
---

## Rationale

Two things that look separate are one function here: the LOG of what happened
and the TRACE of what it means. Both answer the same question a year later,
and both are derived rather than written twice.

The research rows sit here for the same reason. A finding from outside the
repository is a claim like any other, and what makes it usable is that its
sources came with it.

Nothing here decides anything. It records, and it derives views over what it
recorded. That is what keeps it allocatable on its own at M4.
