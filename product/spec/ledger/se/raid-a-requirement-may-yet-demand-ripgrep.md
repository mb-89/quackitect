---
id: se.raid-a-requirement-may-yet-demand-ripgrep
kind: raid
statement: The git-only decision has a lower ceiling than ripgrep and was taken knowingly. git grep cannot match across lines, gives no submatch spans or byte offsets, and cannot search ignored files. None of those is asked for by the current register - which is exactly why the dependency was refused - but the first requirement that asks for one of them overturns the decision rather than bending around it.
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
raid_kind: assumption
raid_owner: agent
trigger: A requirement asking for multiline matching, submatch spans, or search over ignored files. THEN adopt ripgrep via @vscode/ripgrep - the analysis is already done and recorded at enumerate_space/converge_pugh, so the revisit is a decision to re-run rather than research to redo. Do NOT bend git grep around a multiline need with heuristics; that would recreate the hand-rolled searcher this iteration deleted. Same escalation model the field scan found (exact -> structural -> semantic), applied to ourselves.
---


