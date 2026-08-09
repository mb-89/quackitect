---
form: pushed-step
by: agent
signed_off: 2026-08-09T13:11:44.373Z
authors: agent
files:
---

# Evidence form / pushed-step

## current_situation

[[cand-pushed-step]] carries its name, its statement, its five picks and why it was drawn. The other three sections are empty.

The baseline it varies is the system as it stands: the agent asks, the machine answers, and one round trip buys one hop.

## built

Three sections written into [[cand-pushed-step]], and nothing minted beside it.

- How it works — the seams. The machine hands the step out instead of waiting to be asked. One append-only store is what makes that safe: the push carries a position, and a listener that missed one reads forward. The worktree pick is deliberately conservative, so the candidate varies one thing.
- What it costs — the deciding worst case is OBSERVED, not hypothetical. The transport dropped twice this session, once mid-read and once as a timeout. A pull retries; a push loses the step unless the store catches it up.
- What it leans on — four beliefs, and the first is already contradicted. It also names an honest unknown: whether the sixteen-hop re-entry is slow because of round trips or because of re-reading, and if it is the reading, this candidate buys nothing.

Nothing here is scored. All five lines now stand composed.

## follow_up

The bar on run-candidates' end releases with the fifth line, and the walk carries to cut-criteria and evaluate-set. Both already stand from earlier today, so the next thing owed is gate-candidates.

THE GATE IS THE OWNER'S. They rejected it once already and asked to go through it item by item.

## anything_else

