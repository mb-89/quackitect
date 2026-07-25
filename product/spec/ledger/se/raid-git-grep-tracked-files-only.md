---
id: se.raid-git-grep-tracked-files-only
kind: raid
statement: git grep searches TRACKED files by default, so a file the agent just created and has not staged is INVISIBLE to search. That is a hazard aimed precisely at this agent's dominant pattern - reading back what it just wrote - and it is the sharpest edge of choosing git over ripgrep as the single search provider. The mitigation exists (--untracked) but it is a flag, and a flag that must be remembered is a defect waiting for the one time it is not.
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: agent
trigger: "A search that finds nothing while the caller can see the file on disk. RULED NOW so it is not a flag anyone must remember: untracked files are INCLUDED BY DEFAULT for working-tree searches, and the caller opts OUT rather than in. Ref-scoped searches are unaffected - a ref has no untracked files by definition. Test it explicitly: create a file, do not stage it, search for its content, expect a hit."
---


