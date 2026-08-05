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

## The fields, and why

The register is a TABLE so the machine can compute from it, not only
people read it.

- kind — R risk, A assumption, I issue, D dependency. One letter; the
  filter every view starts from.
- entry — the statement, one line, plain words.
- impact — 1 to 5. What it costs if it lands. Half of the priority
  arithmetic.
- likelihood — 1 to 5. How probable it is. The other half.
- owner — the ROLE that works it (the owner, the driving agent, the
  machine). An unowned entry is dead weight.
- revisit — the trigger that reopens it. Append-and-resolve lives here:
  a triggered entry gets revisited, never just re-read.

Impact times likelihood orders the register and draws the risk picture
— the matrix and the graph generate from the rows. An entry without
both numbers cannot be placed and drops out of every computed view,
which is why the table check demands every cell.

## Sources
Standard PM practice; SyA digest.
