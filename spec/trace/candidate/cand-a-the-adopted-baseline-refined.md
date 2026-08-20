---
minted_in: i36
id: cand-a-the-adopted-baseline-refined
type: "[[candidate]]"
name: The adopted baseline, refined
statement: Identify every harness by its handshake, keep the blocking stop hook with evidence-based interruption diagnosis and shape-level failure routing, and read old test records tolerantly.
picks:
  - "[[opt-mcp-clientinfo-identifies-the-harness]]"
  - "[[opt-exit-code-blocks-the-stop-event-until-cleared]]"
  - "[[opt-tolerant-read-across-historical-test-record-shapes]]"
---

## Why this one

Every requirement i36 wrote already assumes this shape; it is the design
the register was built against, not a new proposal competing from scratch.
It carries three refinements the finders surfaced alongside it — a closed
harness type qualified by a typecheck gate, the interruption diagnosis
attached to the call log, and failure shapes classified rather than
recorded per occurrence — traded against keeping every one of the five
functions as new engine code.

## How it works

identify-the-harness reads the connecting client's handshake identity and
sizes the served contract to it. The stop hook blocks the Stop event until
the machine reports a real stopping point; on an interrupted call, the
layer is reconstructed from process, socket and log evidence and attached
to that call's own log record. Repeated failures are classified by their
refusal-clause shape rather than recorded per occurrence. Old test records
are read tolerantly across whichever historical shape they carry. Nothing
else in the resident system changes.

## What it costs

Five new functions are new engine code. The harness type's "illegal
unrepresentable" claim only holds where a typecheck gate actually runs,
which this project does not yet have (opt-closed-harness-type-needs-a-separate-typecheck-gate).
Tolerant reading keeps every historical test-record shape alive in every
reader indefinitely unless later paired with write-time migration.

## What it leans on

req-supported-harness-serves-one-lane-contract, req-native-project-tools-stay-outside-the-cage,
req-stop-hook-yields-only-at-a-machine-stop, req-interrupted-call-names-the-stopping-layer,
req-repeated-failure-shape-becomes-durable-work, req-boot-needs-no-manual-test-metadata-repair.
