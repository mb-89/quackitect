---
id: cand-fast-path-plus-blocking
type: "[[candidate]]"
name: "Fast path plus blocking"
statement: "optimise for scale on both rows: a stat-invalidated cache for reads, grouped review for a wide candidate pool"
picks:
  - "[[opt-cache-corpus-read-invalidated-by-file-stat]]"
  - "[[opt-block-candidates-before-individual-review]]"
---

## Why this one

