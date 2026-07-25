---
id: se.adr-tag-before-merge
kind: decision
statement: "The iteration tag iter/<id> is created on the branch tip BEFORE the merge is committed, and a close that cannot create it refuses before merging anything. Ordering is the whole point: at every intermediate moment the record is either still fully in the tree or already named. Rejected: tagging after a successful merge (leaves a window where the events are out of the tree and unnamed); tagging at open (the tag would point at an empty branch and need moving later, and moving a published tag is the history mutation the no-rewrite rule forbids in spirit)."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: The record loses its only named handle at the exact moment it leaves the working tree; it would survive by hash and become unfindable in practice.
---


