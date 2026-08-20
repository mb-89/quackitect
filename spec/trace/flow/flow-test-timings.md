---
minted_in: i12
id: flow-test-timings
type: "[[flow]]"
statement: every test case's duration, recorded per run and kept across runs
kind: signal
crosses: out
source_refs:
  - req-scoped-run-records-its-timings
  - raid-asm-battery-timings-measure-work
---

## Why it is not the verdict

`flow-battery-verdict` is what a run hands back to whoever asked: totals,
and each failure with its assertion. It is answered once and consumed
immediately.

This is durable and appended. It is read by a LATER act than the one that
produced it, and its whole value is comparison across runs.

A verdict says whether the world still behaves. This says what it cost.
