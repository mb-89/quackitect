---
kind: method
statement: "The RAID log: risks, assumptions, issues, dependencies - each named, owned, and revisited at gates."
---

## Situation
Opened at M1 (top risks; goal conflicts feed it), grown everywhere: design-relevant assumptions live HERE, never inline in prose; M5's sensitivity tripwires land here as watch-items with their fallback; M8's validation gaps land here.

## Procedure
- One entry per item: kind (R/A/I/D), statement, owner, trigger or revisit point, fallback where one exists.
- Assumptions that a requirement builds on get field-probed at M3 (one probe settles what a datasheet claims).
- Every gate's verify round re-reads the entries whose trigger touches the milestone.

## Sources
Standard PM practice; SyA digest.
