---
form: derive-functions
judgment: passed at 2026-08-24T16:19:41.389Z
by: agent
signed_off: 2026-08-24T15:31:26.603Z
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

The new requirements correct how the existing governed-walk function serves a step. They do not add a system capability outside that function's established boundary.

## functions

- fn-run-a-governed-walk.serve-a-step

## flows

- none

## neutrality

The existing function remains solution-neutral: hand the driver one instruction carrying everything that step needs. The four requirements constrain what that instruction and its routing must do. No new technology, algorithm, or element is named.

## follow_up

Implement the traced requirements in the existing governed-walk code paths, then author matching test specifications.

## anything_else

