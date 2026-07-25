---
id: se.adr-milestone-commits-on-branch
kind: decision
statement: "Milestone commits ride the EXISTING bless window and land on the iteration's own branch, never on trunk; trunk changes exactly once per iteration, at the close. Nothing new is invented - only the commit target moves from trunk to the branch. Rejected: committing per loop submit (granularity far below a milestone, and it buries the branch history); committing on a timer (unrelated to any process boundary)."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: An iteration's work exists only as dirty files in one working directory until a close that may write nothing, so losing or tidying that directory destroys it - as nearly happened to i8c's acceptance tests.
---


