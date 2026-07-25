---
id: se.raid-reopen-can-erase-work-by-cone
kind: raid
statement: "Reopen re-activates the named states AND their whole downstream cone - which is correct, since anything downstream was derived from what is being reopened. But the cone is computed from the graph, so reopening an early state supersedes almost everything: at i12 the rewalk reopened draft_vision and superseded 30 fills across a 46-state cone in one call. That is the right semantics and a large hammer, and there is currently no way to reopen a state WITHOUT its cone, nor any confirmation step before a wide reopen."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: agent
trigger: "A reopen whose cone is larger than the caller expected. MITIGATED ALREADY, which is why this is a risk rather than an issue: prior fills are SUPERSEDED, not deleted - the evidence files stay on disk and the history keeps every entry - so a wide reopen costs re-walking, never the record. Fallback if it bites: report the cone size and the supersede count BEFORE applying, and refuse a cone above some fraction of the machine without an explicit confirm."
---


