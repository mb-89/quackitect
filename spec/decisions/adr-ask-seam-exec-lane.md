---
id: adr-ask-seam-exec-lane
decided_in: i0016_structural_models
type: adr
adjudicated_by: user
statement: The ask seam is a Go adapter interface plus one exec adapter kind driving an external process over a file contract.
class: review
killer: false
---
## Rationale (not load-bearing)
Pugh: exec-lane 1.85 vs internal-only 1.53 - the corporate PowerShell adapter (Outlook-COM, Teams flow sink) drops in with NO engine change (owner: corporate wanted soon). Sensitivity reversed: internal-only wins only if the corporate seam is near-worthless and effort paramount - not credible against the standing ruling. The exec contract mirrors the proven role seam (files on disk).
