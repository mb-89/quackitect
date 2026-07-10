---
id: crit-diff-versioning
type: criterion
metric: git-diff signal and semantic-hash stability (0-1)
target: reviewable diffs; cosmetic churn never ripples
statement: The axis weighs git-diff readability and semantic-hash stability under edits.
class: review
killer: false
---
## Rationale (not load-bearing)
Weight 0.10 - moderate because req-semantic-hash absorbs most noise at the ledger; the residue is human diff review. Anchors - 1.0: clean text; 0.9: stable JSON (JSON Canvas); 0.6: volatile-field JSON (Excalidraw seeds and nonces, mitigated by the semantic hash).
