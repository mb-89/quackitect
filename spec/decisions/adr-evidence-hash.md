---
id: adr-evidence-hash
type: adr
adjudicated_by: human
statement: A milestone gate folds the content hash of its milestone evidence doc (M<n>-*.md in the iteration dir) into its full hash: editing blessed evidence flips the gate suspect. Chosen over hashing docs into every subtask (noise without extra protection - the gate holds the verdict).
class: review
killer: false
---
## Rationale (not load-bearing)
Closes the external-review finding: the verdict referent can no longer mutate silently under its report link.
