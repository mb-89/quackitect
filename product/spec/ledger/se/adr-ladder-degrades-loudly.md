---
id: se.adr-ladder-degrades-loudly
kind: decision
statement: "The brief is OPTIONAL BY CONSTRUCTION and the summons is not. If the page cannot be published or confirmed, the card still goes out with its bless and dismiss actions, and the failure is RECORDED where the agent and the owner can see it. This is the single interface in the design permitted to be absent, and it is what makes the adjudication ladder a ladder rather than a chain. Rejected: aborting the announcement when the brief fails (a host outage would become a gate outage); sending the card but staying silent about the failure - which is today's defect one level up, and the reason a broken lane looked exactly like a quiet one for a whole day."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: A failure at a free-tier third-party host silently blocks adjudication, and the agent parks believing the owner was reached.
---


