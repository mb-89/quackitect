---
id: se.req-board-act-race
kind: requirement
statement: When the board receives a poll response issued before the user's last local act, it shall drop that response so a consumed offer can never flicker back.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: "The witnessed ghost-card returns: stale in-flight polls repaint consumed offers."
req_kind: functional
verify_method: test
source_refs:
  - se.stakeholders
---


