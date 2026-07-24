---
id: se.adr-iteration-resolved-roots
kind: adr
statement: "One trunk server serves every stream: loop, gate, merge and projection resolve their root FROM the iteration they serve; work-plane lanes follow the session's open iteration - per-tree servers stay a legal spawn for future subagents."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: The root question reopens per lane - board collisions, fence gaps and reconnect chore return unruled.
edges:
  addresses: [se.req-concurrent-open, se.req-streams-visible, se.req-worktree-start]
---

## Decision

K1-prime from the i5 M5 convergence. One server on the trunk owns lifecycle and serving; roots resolve from the served iteration, never from extra call parameters.

## Rejected

- Per-tree servers as the ONLY mode (K2): certain structural costs today - single-port board collision, lane disagreement during harness reconnects, weaker shipped-signal. Stays the recorded FALLBACK: the spike tripwire (TW1) flips to it mechanically if lane root-resolution breaks CAS/fence law.
- Root parameter on every tool: the arg-stripping trap witnessed at the kickoff grant; schema churn mid-session.
- Hybrid double-serving (K3): dominated - two sanctioned paths to one tree invite double-serve hazards.

## Tripwires

TW1 spike flip (build K2), TW2 subagent-default flip (retire work-plane routing when per-tree subagents become the norm) - armed at reverse_sensitivity.
