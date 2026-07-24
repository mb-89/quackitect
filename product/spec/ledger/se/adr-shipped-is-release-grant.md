---
id: se.adr-shipped-is-release-grant
kind: adr
statement: An iteration counts as shipped for depends_on exactly when its gate_release grant exists in the grants ledger.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: Shipped-ness falls back to instance status files - a weaker, forgeable-by-crash signal than the append-only grant chain.
edges:
  addresses: [se.req-depends-on-gate]
---

## Decision

The grants ledger is the authoritative ship record: depends_on is satisfied by a gate_release grant for the dependency, nothing less.

## Rejected

- Instance status==closed: a crash mid-close or an abandoned iteration also closes; the grant is the acceptance act itself.
