---
id: se.req-runme-dep-free
kind: requirement
statement: The system shall install and verify on a fresh machine through RUNME plus winget Node alone.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: owner
  source: "P3 UC adjudication: uc-run-dep-free -> requirement"
breaks_if_removed: the distribution bar silently regresses to a dev-machine-only setup; the TS ruling's waiver of the static binary loses its counterweight
req_kind: constraint
verify_method: demonstration
must_wish: must
---

## Detail

RUNME.ps1 (winget Node path) and RUNME.sh are the distribution bar ruled 2026-07-22. Verified by running RUNME on a fresh machine: green check = pass.
