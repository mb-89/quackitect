# M5 — Prove the riskiest unknowns (i0024_hygiene)

## riskiest assumptions validated -> i24-m5-riskiest-assumptions-validated

Two spikes ran in the data home. Both answered their question.

Spike A, the card defect (`spikes/i24-card-repro`):

- A minimal fixture workspace reproduced the owner's screenshot exactly.
- Trigger: an open question node with no `## Options` section and no `decided_via`.
- Render: `Bless selects decided_via =` with an empty value and zero option lines.
- The class guard (`test-card-empty-register`) now has its exact fixture.

Spike B, the supervisor mechanics (`spikes/i24-reload-proto`):

- A Go prototype proxied a real `quack mcp` child over stdio.
- On a stamp move it drained the in-flight request, swapped the child, and replayed initialize.
- It emitted `notifications/tools/list_changed` as a well-formed frame.
- The next tools/list was answered by the new child. The whole model-reload-sequence held.

The remaining half of the reload assumption is harness adoption. It stays documentation-backed until M7: after the real build and one reconnect, the live harness either adopts the notification or the M4 tripwire fires and the fallback is console-first.

## design is buildable -> i24-m5-design-is-buildable

The prototype is within a stone's throw of the production shape. Three seam facts the build must honor:

- The supervisor must cache and replay the client's initialize to every new child.
- In-flight tracking is id-based: requests carry ids, notifications do not.
- stderr passes through untouched; the child's logging stays visible.

The walk itself supplied three more design inputs, all found live:

- A served refusal must return a JSON-RPC error, never exit (the crash that killed this session's server).
- The lane guard needs a liveness fallback when the declared MCP server is down.
- The lane guard over-blocks ungated scaffold sub-ops (`start stubs`).

## spike results recorded -> i24-m5-spike-results-recorded

Both spike dirs stay in the data home as scratch. The keepers are captured backward:

- the fixture recipe into this doc and the M6 test step
- the seam facts into this doc and the M6 build plan
- the three live defects into notes, routed to M6

## Review Verdict -> i24-m5-gate

Verify: both spikes have runnable artifacts in the spike dirs. The findings above name their referents.

Validate: the two riskiest assumptions from M4's red-team are exactly what got probed.

Red-team: the unprobed half (harness adoption) is named and bounded, and carries its tripwire and fallback. Accepting it now risks one reconnect, not the iteration.

Verdict: pass. Ready for the gate bless.
