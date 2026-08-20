---
minted_in: i27
id: opt-one-rule-covers-reads-and-writes-alike
type: "[[option]]"
cluster: cluster-the-walk
question: what the resolution rule covers
found_by: heuristic
statement: govern every call by one rule, so a read and a write resolve by exactly the same mechanism and neither can be forgotten
source: the heuristic catalogue — One source of truth; everything else derives. Minted 2026-08-14 to fill the coverage row after the owner found that row conflated with the mechanism row.
---

## Mechanism

There is one rule, and it does not ask what kind of call it is looking at.

WHY IT NEEDED MINTING. The chart's first row originally mixed two questions:
what DECIDES which tree, and what the decision COVERS. Read as one row, a
candidate could carry a mechanism or a coverage rule but never both, and the
candidate whose mechanism was a predicate lost the fatal axis on a coverage
gap it was never allowed to fill.

Splitting the row leaves three candidates with no cell, because their coverage
was never stated - it was assumed. This option states it.

WHO ACTUALLY HAS IT. A confined root, a fixed root and an OS-rooted process
all cover reads and writes by construction: the mechanism resolves a PATH and
does not know or care what the caller will do with it.

WHAT IT COSTS. Nothing to build, because it is a property of those
mechanisms rather than an addition to them. What it costs is FLEXIBILITY - a
single rule cannot be permissive on reads and strict on writes, which
i27's own record says is wanted: one record reaching into another is normal
work, not a leak to be sealed.

THE TRADE AGAINST ITS RIVAL. opt-separate-rules-for-reads-and-writes buys
exactly that flexibility and pays with two rules to keep in step. This one
buys forgetting-proofness and pays with bluntness.
