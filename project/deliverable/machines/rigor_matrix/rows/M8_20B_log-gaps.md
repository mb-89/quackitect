---
kind: matrix-row
name: log-gaps
statement: Log the validation gaps into RAID.
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
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
  - name: gaps
    description: the entries added, or none-found stated
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: every gap into RAID with owner and trigger.
minor_note: |
  Applies: every unfilled slide, at-risk scenario and deferred concern
  into RAID with owner and trigger.
patch_note: |
  Only what the patch itself exposed: a gap found while fixing lands in
  RAID with owner and trigger. Finding none is normal and goes unrecorded.
product_note: |
  Standing obligation: known gaps are IN the register, not in anyone's
  head. A gap discovered twice was lost once - that is the failure this
  cell watches for.
specification_note: |
  DOCUMENT FORM: RAID entries, rendered by the register's derived table.
  No separate artifact.
---

## Guidance

Every unfilled slide, every at-risk scenario, every deferred concern lands in the register with owner and trigger ([[meth-raid]]).
