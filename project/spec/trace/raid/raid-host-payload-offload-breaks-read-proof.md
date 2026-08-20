---
minted_in: i36
id: raid-host-payload-offload-breaks-read-proof
type: "[[raid]]"
kind: issue
statement: Host payload offload can make read-proof prompts unreachable through the lane result path.
owner: the driving agent
trigger: every oversized `se_pull` or `se_survey` result
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: The agent may have to read host chat-session files to recover proof prompts. Boot then depends on host storage behavior.
source_refs:
  - project/spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/onboard-retro.md
  - project/spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/define-actual.md
---

## Finding

Several i36 boot and evidence results crossed the host inline limit.

The host returned a file path.

`se_log_query` also returned the logged response truncated.

## Need

The lane needs a reliable refetch path for large structured results.
