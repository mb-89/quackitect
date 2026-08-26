---
minted_in: i37-training-iterations-a-disposable-iterati
id: flow-rewind-point
type: "[[flow]]"
statement: the commit before the chosen iteration started
kind: signal
source_refs:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
---

## Where it comes from

The parent of the commit whose message is `iteration <id>: started`. MEASURED
2026-08-19 on i33 — `5f85977f` is its started commit and `5f85977f^` resolves
to `20abd831`, which is i35's seed commit. The archive interleaves, and the
rewind keeps that.
