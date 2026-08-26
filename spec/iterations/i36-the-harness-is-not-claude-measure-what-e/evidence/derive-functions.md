---
form: derive-functions
by: agent
signed_off: 2026-08-19T10:46:37.896Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

Requirements are complete for i36's scope: six ISO-quality rows plus the newly authored functional row closing uc-route-failed-calls-into-improvement's coverage gap. This pass derives the solution-neutral function structure those seven requirements demand, reusing the resident fn-arrive-on-a-machine and fn-run-a-governed-walk trees where they already do the work.

## functions

- fn-arrive-on-a-machine.identify-the-harness
- fn-arrive-on-a-machine.place-the-cage
- fn-run-a-governed-walk.tolerate-old-test-records
- fn-run-a-governed-walk.name-the-stopping-layer
- fn-run-a-governed-walk.hold-the-session-through-work
- fn-run-a-governed-walk.route-a-failure-shape
- fn-run-a-governed-walk.keep-the-record
- fn-run-a-governed-walk.serve-a-step

## flows

- flow-harness-profile
- flow-test-check-result
- flow-interruption-report
- flow-stop-decision
- flow-failure-disposition

## neutrality

identify-the-harness: could be built as user-agent sniffing, an MCP client-info handshake, a tool-availability probe, or an environment variable read — none of these is named, only the outcome (a profiled harness). Passed.

tolerate-old-test-records: could be built as versioned schema migration, a tolerant/best-effort parser, or a fallback default per missing field — no parser or format is named. Passed.

name-the-stopping-layer: could be built from process exit codes, transport-error inspection, heartbeat pings, or log correlation after the fact — no mechanism is named. Passed.

hold-the-session-through-work: could be built as a stop-hook script, a supervisor loop, or a keep-alive contract with the host — no mechanism is named. Passed.

route-a-failure-shape: could be built as manual triage, rule-based clustering by refusal clause, or a learned classifier — no mechanism is named. Passed.

place-the-cage and serve-a-step passed neutrality when first minted (i35, i1); this pass only widened their satisfies/inputs lists, which names no new mechanism, so neither needed re-testing.

keep-the-record passed neutrality at i1; adding flow-failure-disposition to its inputs names no mechanism either.

None here failed on this pass.

## follow_up

Sweep the same requirement register for the assumptions it leans on (identify-assumptions).

## anything_else

