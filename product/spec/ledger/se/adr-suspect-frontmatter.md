---
id: se.adr-suspect-frontmatter
kind: adr
statement: "The suspect mark is a frontmatter field (suspect: <merge ref> - reason) written through the apply lane by the ship merge onto every ledger node changed by both lines since the fork point."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: "The mark has no representation - merges go back to silent reunification (probe A3: nothing else exists)."
edges:
  addresses: [se.req-merge-suspects]
---

## Decision

A plain frontmatter field on the node: visible in Obsidian, queryable by search and the warm index, grandfather-safe (absent = not suspect), clearable through the same lane once a human re-adjudicates. Written at merge time from the fork-point overlap set (probe A2's plumbing).

## Rejected

- Sidecar suspects file: hides the mark from every reader of the node.
- On-edge marks: the overlap is node-level; edges already carry suspect DIRECTION for content-change ripple - a different mechanism, untouched.
