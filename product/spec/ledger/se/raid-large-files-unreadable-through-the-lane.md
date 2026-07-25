---
id: se.raid-large-files-unreadable-through-the-lane
kind: raid
statement: A large product file cannot be read through the lane at all. se_file_read takes only a path - no offset, no limit - so the whole file is returned and a 132k-character file (se-v2-design.md, the document every port must consult) is refused as too large. se_file_search finds the right lines but returns them bare, with no surrounding context, so a ruling cannot be read around a hit. Together the two gaps make the design document UNREADABLE via tools, which is precisely what created the pressure to hand-roll a script - so this gap manufactures violations of se.raid-se-run-bypasses-the-lane.
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: "Open now; routed to i9, and it should be fixed BEFORE the fence tightens, since tightening without it would leave no legal way to read the design document. Fix: offset/limit on se_file_read, and a context window on se_file_search hits. Logged as an se_help miss on 2026-07-25 so the retro's miss-walk finds it independently of this entry."
---


