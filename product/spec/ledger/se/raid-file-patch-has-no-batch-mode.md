---
id: se.raid-file-patch-has-no-batch-mode
kind: raid
statement: "se_file_patch applies exactly ONE edit per call, while se_set_apply batches ledger ops freely. So a mechanical multi-site change - six constructor call sites during i8d - costs six calls, each needing its own unique surrounding context to disambiguate, and the pressure to hand-roll a sweep script is structural rather than lazy. Owner 2026-07-25: 'the idea about the patch tools is exactly that you can also batch patches'."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: owner
raid_kind: issue
raid_owner: agent
trigger: "Open now; routed to i9. Fix: an ops array on se_file_patch mirroring se_set_apply's shape - many edits, one call, atomic, each still hash-guarded. This is the affordance whose absence produced ctor-sweep.mjs, so it should land beside the se_run tightening rather than after it."
---


