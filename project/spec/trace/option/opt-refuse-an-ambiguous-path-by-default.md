---
minted_in: i27
id: opt-refuse-an-ambiguous-path-by-default
type: "[[option]]"
statement: refuse a path whose tree is not decidable rather than picking one, so the unsafe case is the one that stops
cluster: cluster-the-walk
question: how a resolution is made visible
found_by: heuristic
source: "the heuristic catalogue — The default should be the safe thing."
---

## Mechanism

Where the rules do not settle which tree a path names, nothing is chosen.
The call refuses, typed, naming the two readings and the exact call for each.

TODAY THE DEFAULT IS THE OPPOSITE. An ambiguous path resolves to whatever
the engine happens to hold, answers ok, and the caller finds out later or
not at all. That is the unsafe branch taken by default.

WHAT MAKES IT CHEAP HERE. The house already has the machinery: every refusal
is typed, names the clause, and carries an executable remedy the caller can
run in one turn. A resolution refusal is one more clause on a shelf that
already holds thirty.

THE MEASURED CASE IT WOULD HAVE CAUGHT. On 2026-08-13 a diagnostic asking
whether the stop hook was wired read the bound worktree's copy, found no
session log, and reported the hook silently allowing every stop. The hook was
fine. Under this rule the read refuses and names both trees, and the false
finding is never written.

WHAT IT COSTS. Refusals where work used to flow, and every one of them is a
real ambiguity that was being resolved by luck. The count of them IS the
measurement of how much luck was in use.

WHAT IT DOES NOT DO. It decides nothing about which tree is right. It only
stops the engine deciding on the caller's behalf without saying so.
