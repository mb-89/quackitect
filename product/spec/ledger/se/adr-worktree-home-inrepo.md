---
id: se.adr-worktree-home-inrepo
kind: adr
statement: Iteration worktrees live in .worktrees/ inside the repo, gitignored, on branches named iter/<iteration-id>.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: Trees scatter to sibling paths nobody discovers, or git add sweeps them in as embedded repos (probe-witnessed).
edges:
  addresses: [se.req-worktree-start, se.req-ship-merge]
---

## Decision

Home: <root>/.worktrees/<iteration-id>, entry .worktrees/ in .gitignore (the probe showed git add otherwise ingests the tree as an embedded repo). Branch naming: iter/<iteration-id>. Discoverable from the root by one rule; dot-prefixed so the structure law's visible-entry count stays honest.

## Rejected

- Sibling directories: dodges the ignore but scatters the filesystem and escapes repo-scoped tooling.
- Arbitrary paths: undiscoverable, violates root coherence.
