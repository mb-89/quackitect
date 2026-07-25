---
id: se.raid-board-opens-a-new-tab-per-start
kind: raid
statement: The board opens a NEW browser tab on every start instead of refocusing one already open, so every boot leaves another orphaned tab. Owner-reported 2026-07-25. The suppression machinery already exists and is wired to only one of two paths - POST /open honours the 6s viewer-freshness window, but server.listen's callback calls openBrowser unconditionally, and se_boot cycles the board.
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
raid_kind: issue
raid_owner: agent
trigger: "Open now; owner-reported, routed to i9 (board cleanup). Fallback: suppression is the cheap half (do not open blind at startup; honour the viewer-freshness window there too), but the owner asked for REFOCUS, which no shell open command can do - that needs the live tab to raise itself on a flag in /state.json. See note-8e8c936d448e."
---


