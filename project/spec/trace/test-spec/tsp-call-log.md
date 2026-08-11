---
id: tsp-call-log
type: "[[test-spec]]"
statement: Every dispatched call lands on the log with its outcome, refusals carry executable remedies, and recorded answers survive, verified by test over the MCP lane and the log.
method: "test"
verifies:
  - "req-every-call-logged"
  - "req-refusal-carries-remedy"
  - "req-acts-carry-role-and-channel"
  - "req-answer-recorded-with-question"
  - "req-audit-answers-from-log"
  - "req-outbound-query-logged"
  - "req-missing-provider-named"
files:
  - "tests/mcp.test.ts"
  - "tests/mcp-http.test.ts"
  - "tests/logquery.test.ts"
  - "tests/nesting.test.ts"
  - "tests/outward.test.ts"
  - "tests/refusals.test.ts"
  - "tests/remedies.test.ts"
---

## Scope

The observability floor: the one-line-per-call law, the typed refusal
with its remedy, the recorded question-and-answer pair, the outbound
research trail, and the log as the retro's one source of counts.

## Approach

Component level over a fresh server per case. Fault-based for the
refusal half (force each refusal class, assert the remedy names real
arguments); round-trip for the logging half (act, then read the log
back by ref). The role-and-channel stamp is DEFINED here ahead of its
case (note-a2ed1eb79e9d holds the build lead); it lands as a named case
in mcp.test.ts asserting the stamp on a logged act.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: a full read-edit-verify round trip over
the wire, and every call logged; rejections are results, not protocol
errors — and carry executable remedies; se_answer records an aq entry
and the feed types it aq; outward options with no recorded query are
red; unconfigured web search refuses with setup instructions, never
fakes.
