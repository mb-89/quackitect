---
state: prepare_idle
state_kind: work
exit:
  preflight:
guidance: Preflight — engine-checked, not claimed. Tick to run the checks and leave; a failure is named in the refusal. Checks today - every machine canvas compiles, every read path resolves, ripgrep and git answer, the call log writes.
---

# Prepare idle

The preflight check before idle. The ENGINE evaluates it (leave_when:
preflight) — the agent cannot claim a green preflight, only trigger one.
Lineage: v1's selftest verified the pointer chain; v2's admission verified
the contract hash and warmed the index. v3 checks what exists today and
grows here as more machinery lands.
