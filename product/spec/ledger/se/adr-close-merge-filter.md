---
id: se.adr-close-merge-filter
kind: decision
statement: "An iteration closes by merging its branch into trunk WITHOUT committing, dropping the classified event paths from the pending merge, then committing - so the merge commit keeps both parents while its tree carries only live claims. Rejected: building the tree by hand (more machinery, same result); merging everything and deleting in a follow-up commit (the invariant would hold only eventually - a checkout of the intermediate commit still contains the events); merge -s ours plus selective checkout (inverts the default, so an unlisted CLAIM is silently dropped, and losing a claim is worse than leaking an event)."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: Trunk keeps collecting the record of how decisions were reached - 57 evidence files in a single close today - until the working tree grows with project age and the live claims are buried in it.
---


