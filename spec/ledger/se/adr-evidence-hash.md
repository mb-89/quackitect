---
id: se.adr-evidence-hash
kind: decision
statement: "A milestone gate folds the content hash of its milestone evidence doc (M<n>-*.md in the iteration dir) into its full hash. Editing blessed evidence flips the gate suspect. This was chosen over hashing docs into every subtask, since that is noise without extra protection: the gate holds the verdict."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0011_geronticide
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Closes the external-review finding: the verdict referent can no longer mutate silently under its report link.
