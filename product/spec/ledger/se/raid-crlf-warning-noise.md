---
id: se.raid-crlf-warning-noise
kind: raid
statement: "Issue: git's LF-will-be-replaced-by-CRLF warnings flood se_run stdout during worktree operations on Windows, burying real output."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: driving agent
trigger: "next engine-hygiene slot: set a repo .gitattributes (* text=auto eol=lf) or core.autocrlf, or filter the warnings from the worktree git calls' captured output"
---


