---
id: se.raid-large-files-unreadable-through-the-lane
kind: raid
statement: "THE LANE'S READ/SEARCH SURFACE IS UNDERPOWERED, and it manufactures workarounds. Three concrete holes. (1) se_file_read takes only a path - no offset, no limit - so a large product file cannot be read at all, and se-v2-design.md (132k chars, the document every port must consult) is refused as too large; the agent has been building from partial reads and memory, which is the leading candidate for the design-doc-to-build drift in note-0b63c57b6c7c. (2) se_file_search returns bare single lines with no surrounding context, so a ruling cannot be read around a hit - locating one line in engine/project.ts took FOUR searches where a context-flagged grep would have taken one. (3) NO GLOB: there is no way to ask where a pattern of FILES lives, so discovery degrades to se_file_list per directory. Owner 2026-07-25, on being told: 'I was actually under the impression that our tools are better than what you usually use... why don't we have it? add a glob to it.'"
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: "Open now; routed to i9, and it should land BEFORE the fence tightens, since tightening without it leaves no legal way to read the design document. THREE FIXES: offset/limit on se_file_read; a context window (and mode/glob filters) on se_file_search; a se_file_glob. OWNER RECONSIDERED 2026-07-25: integrating ripgrep, previously dismissed, may beat hand-rolling all three - it gives context, globs, multiline, counts and file-type filters in one binary. TENSION TO SETTLE FIRST, not to discover halfway: rg is an external BINARY, which sits against the zero-runtime-dependency stance and the one-click-install ruling. Candidate resolutions: optional acceleration with a hand-rolled fallback when rg is absent; or vendor-and-credit as done for the QR library; or hand-roll only the three affordances above and skip rg. Decide it as an ADR rather than by drift. SEPARATE, AND NOT A GAP: se_get_search (BM25 over ledger nodes) is genuinely BETTER than grep for guidance and must not be replaced by any of this."
---


