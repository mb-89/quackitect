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
entry_read:
  - deliverable/machines/methods/meth-raid.md
evidence:
  - name: raid_opened
    template: refs
    of: raid
    description: every entry opened here, as a raid node reference, one per line
    guidance: |
      Write each entry as a node shaped by [[raid]], then name it here.
      The node carries its kind and its owner. It carries the trigger, the impact and the statement too.
major: full
major_complexity: C3/R3
minor: tailored
minor_complexity: C3/R3
patch: tailored
patch_complexity: C3/R3
product: full
product_complexity: C3/R3
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

Open the register ([[meth-raid]]), which the entry read demands before this
state opens.

The goal system's named conflicts are the first entries. Add the top risks the
vision and delta expose, with an owner and a revisit trigger on each.

EACH ENTRY IS A NODE, not a table row. A table row
is per-iteration, carries no id, and freezes at sign-off.

So an entry recorded here could never be pointed at. An assumption recorded
here could never be probed by a later iteration.

Both ancestors already knew this. v1 shipped a raid item template with a
per-kind query view, and v2 shipped one file per entry.

This field carries references. The register a person reads is a view over the
folder.

RISKS OPEN HERE. Assumptions have two states of their own at M3.

- identify-assumptions sweeps for them.
- probe-assumptions checks every standing one.

An assumption noticed HERE is still recorded here rather than held back.
Waiting for the right state is how an entry is lost.
