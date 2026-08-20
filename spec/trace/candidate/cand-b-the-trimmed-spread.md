---
minted_in: i36
id: cand-b-the-trimmed-spread
type: "[[candidate]]"
name: The defended adapter
statement: Identify the harness from the MCP handshake into a closed type with Unknown, retain shape-level failure routing, and make the Copilot blocking stop hook corroborate liveness with a heartbeat.
picks:
  - "[[opt-mcp-clientinfo-identifies-the-harness]]"
  - "[[opt-self-reported-heartbeat-instead-of-blocking-hook]]"
  - "[[opt-tolerant-read-across-historical-test-record-shapes]]"
---

## Why this one

Candidate B keeps the same hard-demand allocations as Candidate A, but
defends the uncertain Copilot path differently. The handshake identity is
normalized into a closed harness type with an explicit Unknown case. The
blocking stop hook remains authoritative, while a heartbeat gives a capable
host additional evidence that active work is still running.

This makes the Copilot adapter more defensive around an unrecognized client
or a stop request. It costs an extra liveness channel and an explicit
fallback for hosts that cannot carry one.

## How it works

identify-the-harness reads the MCP handshake, normalizes it to a named
supported harness or Unknown, and selects the corresponding lane profile.
The Copilot adapter implements the same blocking stop contract as the
Anthropic path. Where a host can receive it, the walk also emits a heartbeat;
a heartbeat complements the veto and never substitutes for it.

Interruption diagnosis attaches process, socket and log evidence to the call
record. route-a-failure-shape groups the resulting failures by clause or
error shape and routes the aggregate into durable work. Old test records are
read tolerantly, as in Candidate A.

## What it costs

The closed type makes every new supported harness an explicit adapter
change. A host without a heartbeat channel still relies solely on the
blocking veto, so the heartbeat is extra complexity without universal
coverage. This candidate also needs a live Copilot proof that a stop request
is blocked during active work and accepted only at a machine-recognized stop.

## What it leans on

req-supported-harness-serves-one-lane-contract,
req-stop-hook-yields-only-at-a-machine-stop,
req-interrupted-call-names-the-stopping-layer,
req-repeated-failure-shape-becomes-durable-work,
req-boot-needs-no-manual-test-metadata-repair,
opt-closed-harness-type-with-explicit-unknown,
opt-self-reported-heartbeat-instead-of-blocking-hook and
opt-classify-failure-shape-by-refusal-clause-not-occurrence.
