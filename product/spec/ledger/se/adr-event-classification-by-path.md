---
id: se.adr-event-classification-by-path
kind: decision
statement: "What counts as an event rather than a live claim is decided by path rules held by the engine - an iteration's evidence, machines and state - because the repository layout already encodes the distinction and the rule stays inspectable in one place. Rejected: a frontmatter field per node (evidence runs are JSON, not nodes with frontmatter, so it cannot classify the heavy material at all); per-iteration configuration (makes the invariant negotiable per iteration, which is how a rule erodes)."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: The close has no rule for what to withhold, so either everything merges (today's behaviour) or the choice is made ad hoc per iteration, which makes the invariant unenforceable.
---


