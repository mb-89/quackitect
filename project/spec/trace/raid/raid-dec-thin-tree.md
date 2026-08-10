---
id: raid-dec-thin-tree
type: "[[raid]]"
kind: decision
statement: A record's worktree holds only the record's own folder — shared method is read from trunk at the moment it is needed.
owner: the maintainer
trigger: a measured trunk-read cost above the walk's patience, or a walk broken by trunk moving mid-flight
status: decided
impact: Wrong, the isolation collapses back to copies and the copy-fan-out class returns.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - opt-worktree-holds-only-the-record
  - cand-thin-worktree
  - req-trace-source-never-mixes
  - req-entry-binds-worktree
---

The winner's core seam. SE-C-134 stops being a rule the agent must remember
and becomes a fact about the filesystem: there is no method file in the tree
to overwrite.

The bet this rides: reading from trunk is fast enough per access, and a walk
survives the method moving under it. Both are probed by this iteration.

## Rejected options

- [[opt-worktree-per-record]] — the full copy, today's shape. It froze the
  method per record and enabled the 2026-08-07 fan-out breach.
- [[opt-the-branch-is-the-record]] — no isolation seam at all.

## Consequences

- Every shared read is a trunk read.
- A pinned ref per record is the fallback if some walks prove to need a
  frozen method.
- The stale-read failure mode decides: if trunk access caches, the tree has
  a copy again by another name.
