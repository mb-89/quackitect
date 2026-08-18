---
minted_in: i1
id: raid-dec-thin-tree
type: "[[raid]]"
kind: decision
statement: A record's worktree holds only the record's own folder — shared method is read from trunk at the moment it is needed.
owner: the maintainer
trigger: a measured trunk-read cost above the walk's patience, or a walk broken by trunk moving mid-flight
status: superseded
impact: Wrong, the isolation collapses back to copies and the copy-fan-out class returns.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - opt-worktree-holds-only-the-record
  - cand-thin-worktree
  - req-trace-source-never-mixes
superseded_by: raid-dec-one-tree-beats-a-record-travelling-between-machines
---

The winner's core seam. SE-C-134 stops being a rule the agent must remember
and becomes a fact about the filesystem: there is no method file in the tree
to overwrite.

The bet this rides: reading from trunk is fast enough per access, and a walk
survives the method moving under it.

THE READ HALF IS MEASURED (2026-08-10, exp-trunk-read-cost): 2.0 ms per
file through one long-lived git batch reader, against 0.5 ms plain disk.
The bet holds IN THAT SHAPE ONLY — a git process spawned per read costs
47 to 54 ms and falls. The moving-trunk half stays with this iteration's
own goal.

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

## Superseded

THE SEAM IT DECIDED NO LONGER EXISTS. This ruled what a record's own checkout
holds, and there are no record checkouts: one tree, and a record is a folder
inside it.

WHAT SURVIVES IT. The thing it was protecting — a method file that cannot be
overwritten from inside a record — holds by construction now, because there is
only one copy of every method file for anybody to open.
