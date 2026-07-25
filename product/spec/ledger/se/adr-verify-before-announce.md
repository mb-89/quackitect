---
id: se.adr-verify-before-announce
kind: decision
statement: "A brief's link is announced only AFTER the page is confirmed to serve. The store is eventually consistent, so an immediate notification can point at nothing. MEASURED rather than assumed: the read-after-write window is about one second here, which refines se-v2-design §18's ~60s figure - the hazard is real but the retry budget is small. Rejected: notifying optimistically (the exact failure the design recorded from its own dry run); sleeping on the documented ~60s (slower and less certain than simply checking)."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: The owner taps a link into a 404 and cannot tell whether the system is broken or the decision is gone.
---


