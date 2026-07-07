---
id: cand-impl-derive
type: candidate
axis: implements-lane
ratings:
  trust: 0.3
  dry: 0.6
  churn: 0.4
statement: Derive connection notes from the code design markers at build time.
class: review
killer: false
---
Pro: the connections home holds literally everything. Con: every failure mode is silent-drift-shaped - stale generated files after marker edits, orphan connections after refactors bricking the strict guard, read commands writing the workspace, permanent git churn of generated files. (Trust red-team verdict, 2026-07-06.)
