---
id: se.adr-untracked-files-are-searched-by-default
kind: decision
statement: "WORKING-TREE SEARCHES INCLUDE UNTRACKED FILES BY DEFAULT; the caller opts OUT, never in. ADDRESSES criterion C1 freshness (a veto), R3, and se.raid-git-grep-tracked-files-only. git grep's own default is tracked-files-only, which would make a file the agent just created and has not staged INVISIBLE to search - aimed exactly at this agent's most common pattern, reading back what it just wrote. The mitigation exists as a flag, and a flag that must be remembered is a defect waiting for the one time it is not, so the default is inverted at our boundary. Ref-scoped searches are unaffected: a ref has no untracked files by definition."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---


