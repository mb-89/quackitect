---
minted_in: i36
id: raid-asm-documented-harness-limits-stay-stable
type: "[[raid]]"
kind: assumption
statement: Each supported harness's documented size limit (Claude Code's tool-description truncation, Copilot CLI's result-offload threshold, Codex's project_doc_max_bytes, Cursor's rule and MCP bounds) stays the same across vendor releases.
owner: the driving agent
trigger: any vendor changelog or observed behaviour change touching a documented limit; the quarterly harness re-scan this iteration's follow_up owes
status: open
probe: "No cheap check exists this session: verifying this needs re-fetching each vendor's current documentation and comparing it to the cited figures. draw-context's follow_up already schedules that fresh primary-source scan before design settles; this stays unprobed until that scan runs."
probed: unprobed 2026-08-19 — see draw-context follow_up
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - ref-agent-harness-portability-2026-08-19
weighs_with: none
weighs_against: none
---

## Probe

Re-run the primary-source scan per harness and diff the cited limit against
today's documentation and one live measurement. A changed number falsifies
the assumption for that harness only; the others are unaffected.
