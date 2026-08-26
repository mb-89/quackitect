---
minted_in: i37-training-iterations-a-disposable-iterati
id: flow-benchmark-report
type: "[[flow]]"
statement: the filled report, the only thing a run commits
kind: signal
crosses: out
source_refs:
  - req-a-benchmark-report-carries-the-conditions-of-its-run
  - req-a-run-that-stopped-early-says-where-it-stopped
---

## It crosses OUT

The report lands in the corpus and outlives the run. Everything else the run
touched is discarded with the tree.
