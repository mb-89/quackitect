---
state: prepare_idle
state_kind: work
priority: 0.01
exit_script:
  - product/deliverable/engine/bin/preflight.ts
guidance: Preflight — the exit script runs the checks. Tick to run it. A failure is named in the refusal.
---

# Prepare idle

The preflight check before idle. The ENGINE evaluates it (leave_when:
preflight) — the agent cannot claim a green preflight, only trigger one.
Lineage: v1's selftest verified the pointer chain; v2's admission verified
the contract hash and warmed the index. v3 checks what exists today and
grows here as more machinery lands.
