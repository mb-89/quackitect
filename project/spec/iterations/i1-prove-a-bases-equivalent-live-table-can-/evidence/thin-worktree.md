---
form: thin-worktree
by: agent
signed_off: 2026-08-09T13:10:54.986Z
authors: agent
files:
---

# Evidence form / thin-worktree

## current_situation

[[cand-thin-worktree]] carries its name, its statement, its five picks and why it was drawn. The other three sections are empty.

The baseline it varies is the system as it stands: a worktree holding a full copy of the tree, method included, guarded by a refusal rather than by its shape.

## built

Three sections written into [[cand-thin-worktree]], and nothing minted beside it.

- How it works — the seams. The tree holds the record's folder only; everything shared is read from trunk when wanted. SE-C-134 stops being a rule and becomes a fact about the filesystem. Stable ids carry the references across the boundary, and the two-layer check judges a write by its path.
- What it costs — mostly reuse. The worst case is a trunk that moves mid-walk, which the current frozen copy prevents by construction. HOW OFTEN THAT WOULD BITE IS NOT KNOWN.
- What it leans on — four beliefs. The one this candidate most needs probed is whether a trunk read is fast enough to do per access. It is unmeasured.

Nothing here is scored.

## follow_up

One line left: [[cand-pushed-step]]. When it stands, the bar on the machine's end releases.

## anything_else

