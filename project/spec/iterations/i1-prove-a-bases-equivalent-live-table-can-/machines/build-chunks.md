---
steps:
  - id: trunk-batch-reader
    statement: "every trunk-ref read rides one long-lived batch reader — promoted from exp-trunk-read-cost, standing in expmachine.ts"
    depends_on: []
    realization: software
---
