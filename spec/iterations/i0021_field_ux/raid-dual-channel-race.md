---
id: raid-dual-channel-race
type: raid
statement: A phone tap made while the hand-off page is open applies only at the next drain. A page answer in the same window can record a second bless event on the same gate.
kind: risk
probability: 0.2
impact: 0.4
mitigation: The round already invalidates on answer or close; residual window is seconds wide; harden by draining inside the page server loop if it ever bites.
owner: the driving agent
status: open
killer: false
provenance:
  mitigation: user-ruling via handoff
---
