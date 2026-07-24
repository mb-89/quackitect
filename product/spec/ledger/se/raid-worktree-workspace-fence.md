---
id: se.raid-worktree-workspace-fence
kind: raid
statement: "Risk: a worktree's own workspace/ directory is fence-denied because the session lock exempts only the trunk workspace; harmless in sequential mode, but a per-tree agent could not use its workspace."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: driving agent
trigger: "the first real per-tree-server subagent run (TW2's world): add a per-root workspace exemption to the lock when a worktree gets its own server"
---


