---
id: se.raid-worktree-provisioning-incomplete
kind: raid
statement: "A provisioned worktree is not self-sufficient: it carries no node_modules (so `npm run verify`'s tsc cannot run) and, if cut before uncommitted trunk engine fixes are committed, runs a stale/inconsistent engine. i8c hit both - its worktree needed a node_modules junction and a sync of the i5c layout/worktree/project/gate fixes before its first full verify passed."
provenance:
  iteration: i8c-phone-connect
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: provisionWorktree installs-or-junctions node_modules AND forks from a committed, current engine (or commits engine prerequisites first); close when a freshly provisioned worktree runs `npm run verify` green with zero manual patching.
---


