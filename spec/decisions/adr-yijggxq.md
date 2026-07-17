---
id: adr-yijggxq
type: adr
decided_in: i0025_clean_state
adjudicated_by: user
statement: The never-cached suite: workspace-state watchers evaluated live, never cached, never counted into gate history. Renamed from standalone (owner ruling 2026-07-16): the old word named how they run; the invariant worth naming is that no verdict of theirs is ever cached. The parser reads the legacy word as the new one, so external workspaces keep loading.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm
---
## Rationale (not load-bearing)
The old word "standalone" described HOW the suite runs. The owner's 2026-07-16 ruling picked the invariant worth naming: these watcher verdicts are NEVER cached and never enter gate history. Other tests are live sometimes; this suite always. The parser aliases the legacy word so external workspaces keep loading unchanged.
