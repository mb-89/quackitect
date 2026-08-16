---
form: spike-query-latency-at-real-scale
by: agent
signed_off: 2026-08-16T18:36:54.556Z
authors: agent
files:
---

# Evidence form / spike-query-latency-at-real-scale

## current_situation

rank-unknowns seeded one spike: settle whether el-query-evaluator's declarative AND-filter answers a query against the real ~328+ file trace corpus inside the one-second bound, since the only standing evidence was a 4-node fake.

## built

- exp-i15-query-latency-at-real-corpus-scale

## follow_up

Verdict holds, 32x margin (31 ms measured against 768 real files vs the 1000 ms bound), which comfortably absorbs the throttled-hardware discount raid-asm-the-target-machine-is-many-throttled-cores names. Folded into raid-risk-i15-query-latency-unmeasured-at-real-scale: status moved open to mitigated with the dated measurement in its body. No design change is owed — the fallback (reopening the cache decision) was not needed.

## anything_else

