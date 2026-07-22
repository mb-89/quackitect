---
id: se.rule-owner-pushes
kind: rule
statement: The agent never pushes to origin; pushing is an owner act. The engine refuses push on the agent lane (SE-C-003).
provenance:
  adjudicated_by: owner
  channel: chat-session
  iteration: post-b6
  ai_involvement: owner-ruled-agent-transcribed
breaks_if_removed: agent pushes publish unreviewed state under the owner name; the owner loses the final publication gate over every remote
---

## Ruling (owner, 2026-07-22, post-bootstrap)

Commits are the agent lane; the remote is the owner lane. The agent
commits locally through the normal write paths; the OWNER pushes.

Enforcement: the engine git layer refuses push on the agent lane
(SE-C-003), alongside the existing history-rewrite refusal (SE-C-002).
Session agents follow the same rule regardless of lane.

Bootstrap note: B0-B6 and the benjamin scaffold were pushed by the
agent BEFORE this ruling existed; grandfathered (adr-grandfathers-
historical), not precedent.
