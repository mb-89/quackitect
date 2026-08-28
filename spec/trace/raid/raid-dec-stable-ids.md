---
unreachable_refs:
  - cand-thin-worktree
minted_in: i1
id: raid-dec-stable-ids
type: "[[raid]]"
kind: decision
statement: References cross the record boundary as stable ids pointing at authoritative text — never as copies.
owner: the maintainer
trigger: an orphan check finding ids that resolve nowhere
status: decided
impact: Wrong, the trace decays into duplicates that drift apart, and no reader can tell which copy binds.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - opt-stable-ids-not-copies
  - cand-thin-worktree
  - req-trace-view-derived-from-files
  - req-reachable-capability-is-traced
---

The second seam of the thin tree: with shared method out of the record's
tree, ids are the only currency that crosses the boundary. The orphan check
is what keeps the currency honest.

## Rejected options

- copies riding in the record's tree — the shape [[opt-worktree-per-record]]
  implies, where every reference is satisfied locally and drifts locally.
- [[opt-citation-graph-as-the-trace]] — references as prose citations, with
  no mechanical resolution.

## Consequences

- The orphan check is load-bearing and runs at every submit.
- A renamed node owes a migration; ids are contracts.
