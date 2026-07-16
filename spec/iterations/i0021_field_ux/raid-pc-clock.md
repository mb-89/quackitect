---
id: raid-pc-clock
type: raid
statement: This machine's clock runs about one hour ahead of real time. Ask staleness is shielded via channel-clock stamps. Ledger event timestamps and note ids still carry the skewed local time.
kind: issue
probability: 1.0
impact: 0.2
mitigation: The owner resyncs the clock (w32tm /resync or Settings); the channel-clock comparison shipped 2026-07-14 keeps phone blesses immune either way.
owner: the owner
status: open
killer: false
provenance:
  mitigation: user-ruling via handoff
  kind: user-ruling via handoff
---
