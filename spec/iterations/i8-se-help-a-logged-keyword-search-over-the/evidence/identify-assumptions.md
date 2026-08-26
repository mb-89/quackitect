---
form: identify-assumptions
by: agent
signed_off: 2026-08-12T21:06:05.715Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

M3 identify-assumptions: one real assumption opened, the rest of the sweep turns up nothing new.

## assumptions

- raid-asm-help-query-vocabulary-overlaps

## sweep

- environment: none. No new scale, load or data-shape assumption — se_help reads the same project root and .se directory every other tool already reads.
- toolchain: none. No new dependency; engine/help.ts uses only node:fs and node:path, already used throughout the engine.
- host: none beyond the standing nbr-agent-harness contract. se_help dispatches through the same MCP call path as every other tool.
- platform: none new. File reads/appends behave the same as se_note's existing .se/notes.jsonl pattern, already proven cross-platform.
- neighbours: none new — no new neighbour crosses the boundary (see draw-context).
- people: raid-asm-help-query-vocabulary-overlaps — an agent's words and the lane's own words are assumed close enough for keyword overlap to find a real match.

## follow_up

probe-assumptions next.

## anything_else

