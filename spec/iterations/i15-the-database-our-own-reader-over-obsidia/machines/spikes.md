---
steps:
  - id: spike-query-latency-at-real-scale
    statement: "TIMEBOX: 45 minutes. Measure the filter-expression evaluator against the real ~328-file trace corpus (not the 4-node fake the earlier probe used). Pre-agreed fallback if it runs over one second: cand-fast-path-plus-blocking's stat-invalidated cache design is already on record to reopen with."
    depends_on: []
    realization: software
---
