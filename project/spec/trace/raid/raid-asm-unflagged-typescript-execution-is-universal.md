---
minted_in: i36
id: raid-asm-unflagged-typescript-execution-is-universal
type: "[[raid]]"
kind: assumption
statement: Every supported harness spawns the engine's scripts under a Node runtime where unflagged TypeScript execution is the default.
owner: the driving agent
trigger: onboarding a harness or a runtime pin change that spawns scripts differently
status: open
probe: "Cheapest real check ran this session: node -v reported v24.18.0, and node scratchpad/probe-ts-exec.ts executed a real .ts file unflagged and printed its result. HOLDS on this Windows host; the other supported hosts (Copilot CLI, Codex, Cursor, cloud POSIX) are unprobed this session."
probed: "2026-08-19"
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-supported-harness-serves-one-lane-contract
  - project/deliverable/package.json
weighs_with: none
weighs_against: none
---

## Probe

On each supported harness's own host shape (local, cloud, container), run
`node <file>.ts` with no flag against the pinned engines.node version and
confirm it executes rather than erroring on the TypeScript syntax.
