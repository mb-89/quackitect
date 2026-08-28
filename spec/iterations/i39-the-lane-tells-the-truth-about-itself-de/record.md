---
id: i39-the-lane-tells-the-truth-about-itself-de
status: seeded
opened: 2026-08-20T16:48:23.718Z
goal: "The lane tells the truth about itself: descriptions match handlers — se_amend chain stripped, se_run timeout implemented with SE-C-107, full output pageable through the lane — source labels name their raising file, the stale counts correct, and boot probes whether the cage actually binds."
vision: |-
  Item list with file:line in spec/overhauls/2026-08-20/plan.md, seed 1, plus owner decisions 6 and 9 (2026-08-20): implement the timeout; probe now, wall later.

  DONE LOOKS LIKE: an amend with chain:true touches no downstream file; a run past its timeout_ms refuses SE-C-107; a 40k-output run pages back whole through se_log_query; every Rejection source names the file that throws it, and a lint holds that; the stop hook counts five and se-start counts six; on a host where a native-path read succeeds, the boot banner says the cage is advisory.
inputs:
  - spec/overhauls/2026-08-20/plan.md
  - spec/overhauls/2026-08-20/findings.md
depends_on: []
---

# i39-the-lane-tells-the-truth-about-itself-de

## Goal

The lane tells the truth about itself: descriptions match handlers — se_amend chain stripped, se_run timeout implemented with SE-C-107, full output pageable through the lane — source labels name their raising file, the stale counts correct, and boot probes whether the cage actually binds.

## Rough vision

Item list with file:line in spec/overhauls/2026-08-20/plan.md, seed 1, plus owner decisions 6 and 9 (2026-08-20): implement the timeout; probe now, wall later.

DONE LOOKS LIKE: an amend with chain:true touches no downstream file; a run past its timeout_ms refuses SE-C-107; a 40k-output run pages back whole through se_log_query; every Rejection source names the file that throws it, and a lint holds that; the stop hook counts five and se-start counts six; on a host where a native-path read succeeds, the boot banner says the cage is advisory.

## Inputs

- spec/overhauls/2026-08-20/plan.md
- spec/overhauls/2026-08-20/findings.md

## Carried notes

- note-b7c90887caa1 — a script was written to find orphan work tokens without
  first checking whether a lane verb answers it. The engine already computes
  the relation: se_file_delete returns cited_by for a trace node. It is exposed
  only on a destructive call, so "who cites this" has no read-only verb.
