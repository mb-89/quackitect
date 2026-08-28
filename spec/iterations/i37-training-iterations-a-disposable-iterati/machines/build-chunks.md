---
steps:
  - id: stand-the-rewound-tree
    statement: "Name the rewind commit as a ref and fetch it at depth 1, applying the three-way split: project/spec rewound, project/deliverable and project/guidance current, history bounded. Two M6 spikes enter here pre-verified."
    depends_on: []
    realization: software
  - id: bind-a-run-and-write-its-conditions
    statement: "se_benchmark opens and closes a run: choose the iteration or take the least recently benchmarked, locate the started commit's parent, refuse to bind where any of it cannot be established, and write the model, the effort and the harness."
    depends_on:
      - stand-the-rewound-tree
    realization: software
  - id: derive-what-the-walk-cost
    statement: Walk the call log and carry each se_pull's where until the next, producing calls, wall clock, forms filled, forms refilled after a refusal, refusals by clause, and states visited and re-entered, per state. One M6 spike enters here pre-verified.
    depends_on: []
    realization: software
  - id: write-the-benchmark-report
    statement: "The benchmark-run item template plus the incremental writer: the report exists before the run ends, because a run that dies is the interesting one. Carries the conditions stamp and both stop fields."
    depends_on:
      - bind-a-run-and-write-its-conditions
      - derive-what-the-walk-cost
    realization: software
  - id: conceal-the-reports-while-a-run-is-bound
    statement: The visibility rule at four measured call sites across three files - paths.ts, search.ts and fileRead in files.ts - written against the sites and never against one of the four disagreeing exclusion lists. Blocked on a work token this iteration does not own.
    depends_on:
      - bind-a-run-and-write-its-conditions
    realization: software
---
