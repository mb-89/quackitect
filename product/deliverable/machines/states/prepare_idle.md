---
state: prepare_idle
state_kind: work
priority: 0.01
exit_script:
  - product/deliverable/engine/bin/preflight.ts
  - product/deliverable/engine/bin/selftest.ts
guidance: Preflight and the full selftest suite — the exit scripts run them. Tick to run; expect a few seconds. A failure is named in the refusal.
---

# Prepare idle

The checks before idle. The ENGINE evaluates them — the agent cannot claim
a green engine, only trigger the run. Two scripts: the sub-second
preflight (canvases compile, hard deps answer, .se writable — RUNME runs
the same one at launch so starting stays instant) and the FULL test suite
(moved here from RUNME so its seconds are spent inside boot, once,
engine-observed). Lineage: v1's selftest verified the pointer chain; v2's
admission verified the contract hash and warmed the index.
