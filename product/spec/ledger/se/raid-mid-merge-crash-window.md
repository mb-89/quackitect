---
id: se.raid-mid-merge-crash-window
kind: raid
statement: "The close is atomic with respect to recorded history but not to the working copy: between `git merge --no-commit` and the commit, trunk's index and working tree are mid-merge. A crash there does not move HEAD, so nothing recorded is lost and no refusal path is skipped, but the working copy is left needing a human `git merge --abort`. Flagged at the architecture gate as an at-risk residue rather than claimed as addressed, because the quality scenario says trunk is unchanged and HEAD-unchanged is narrower than that."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: agent
trigger: "A crash or kill during a close. Mitigation if it ever bites: detect a pending MERGE_HEAD at the next close and refuse with the abort instruction rather than merging on top of it."
---


