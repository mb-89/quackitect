---
kind: matrix-row
name: log-risks
statement: "Log the top risks: the RAID register opens."
state_kind: work
filled_by: agent
depends_on:
  - draft-vision
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: raid_opened
    description: "the top entries, each with kind, owner and trigger"
major: full
minor: tailored
patch: tailored
product: full
specification: full
major_note: |
  Applies in full for the change: an architectural move carries real
  risk, and the register is where it lives. New entries with owners and
  triggers; the standing register is re-read, not re-derived.
minor_note: |
  The register stands; the delta's new risks enter with owner and trigger.
  The goal conflicts of the DELTA - not the whole goal system - are
  checked for new entries.
patch_note: |
  The register is not re-derived. One duty survives at patch size: a risk
  the patch EXPOSES gets its entry, with owner and trigger. Finding none
  is the normal outcome and is not recorded anywhere but the leave form.
product_note: |
  STANDING ARTIFACT: the RAID register - one register for the product,
  never per-iteration copies. At rest every entry carries kind, owner and
  revisit trigger, and triggered entries have been revisited. The
  register is append-and-resolve, not append-only.
specification_note: |
  DOCUMENT FORM: the RAID register as a QUERY-DRIVEN TABLE - entries are
  nodes, the table derives (v1's raid-matrix figure). Never hand-tabled:
  the register is edited as entries, the render assembles.
---

## Guidance

Open the register ([[meth-raid]]). The goal system's named conflicts are the first entries; add the top risks the vision and delta expose. Owners and revisit triggers on each.
