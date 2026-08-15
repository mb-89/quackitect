---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-engine-lifecycle
type: "[[test-spec]]"
statement: The engine restarts clean, lands crashes safe, answers inside its latency line, and serves its own machine only, verified by test over the process lifecycle.
method: "test"
verifies:
  - "req-surface-answers-in-one-second"
  - "req-crash-lands-safe"
  - "req-reload-restarts-clean"
  - "req-call-answers-in-one-second"
  - "req-mirror-stays-on-the-machine"
  - "req-engine-port-fallback"
files:
  - "tests/ticks.test.ts"
  - "tests/lifetime.test.ts"
  - "tests/ptyend.test.ts"
  - "tests/stophook.test.ts"
  - "tests/mcp-http.test.ts"
  - "tests/latency.test.ts"
---

## Scope

The process's constitution: reload from disk at idle, the crash and
silence paths, the one-second answer line, loopback-only serving, and
the port fallback.

## Approach

Component and system level. FOUR of the five claims are DEFINED ahead of
their full cases. tests/latency.test.ts is the planned home for the
one-second line — exp-latency-ledger measured it FALLING on 2026-08-10
(12 of 118 pulls over one second), so this case is expected RED until
the async round's ticket desk lands; writing it red is the point. The
loopback, crash-collapse and port-fallback cases land as named cases in
mcp-http.test.ts and lifetime.test.ts with their builds. What runs
today: the reload gate, the process-tree kill, and the stop hook's
silence rules.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps today: se_reload: refused off-idle,
dry-runs its canary at idle, free under emergency; deactivate kills the
process tree, not just the handle it holds; a walk standing mid-work
blocks the stop, and the reason names the state.
