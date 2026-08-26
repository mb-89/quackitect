---
minted_in: i36
id: raid-asm-the-harness-scan-still-matches-current-releases
type: "[[raid]]"
kind: assumption
statement: The 2026-08-18 primary-source harness research scan describes each vendor's current release rather than a superseded one.
owner: the driving agent
trigger: any vendor release note dated after 2026-08-18 touching a cited limit or behaviour
status: open
probe: "No cheap check exists this session: it needs each cited source re-fetched and its publish or last-updated date compared against 2026-08-18. draw-context's follow_up already schedules that scan; stays unprobed until it runs."
probed: unprobed 2026-08-19
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - spec/references/ref-agent-harness-portability-2026.md
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/draw-context.md
weighs_with: none
weighs_against: none
---

## Probe

Re-check each cited claim's source URL for a publish or last-updated date
after 2026-08-18, and re-fetch any that changed. draw-context's follow_up
already schedules this fresh scan before design settles.
