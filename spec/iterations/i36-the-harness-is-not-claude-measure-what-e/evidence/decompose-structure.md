---
form: decompose-structure
by: agent
signed_off: 2026-08-19T13:38:00.403Z
authors: agent
files:
---

# Evidence form / decompose-structure

## current_situation

Candidate A’s direct blocking-stop architecture is selected. Existing elements now carry every new i36 function: arrival identifies the harness, the walk engine enforces and diagnoses the stop path, and the mirror owns the shared HTTP transport.

## elements

- [[el-arrival]]: identifies the connecting harness during arrival and selects its declared lane profile.
- [[el-walk-engine]]: enforces the blocking stop contract, names an interruption layer, routes repeated failure shapes and reads old test records.
- [[el-mirror]]: serves the shared HTTP MCP connection with bounded responses and a long-lived keep-alive policy for Copilot.

## allocation

- [[el-arrival]]: fn-arrive-on-a-machine.identify-the-harness
- [[el-walk-engine]]: fn-run-a-governed-walk.hold-the-session-through-work; fn-run-a-governed-walk.name-the-stopping-layer; fn-run-a-governed-walk.route-a-failure-shape; fn-run-a-governed-walk.tolerate-old-test-records
- [[el-mirror]]: the shared transport obligations for req-oversized-results-remain-recoverable-through-the-lane, req-stop-hook-yields-only-at-a-machine-stop and req-interrupted-call-names-the-stopping-layer

## follow_up

Evaluate the assembled architecture against the requirements, then implement the selected Copilot stop contract and live interruption proof.

## anything_else

