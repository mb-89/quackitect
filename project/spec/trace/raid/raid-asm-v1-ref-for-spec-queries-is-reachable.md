---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-asm-v1-ref-for-spec-queries-is-reachable
type: "[[raid]]"
kind: assumption
statement: v1's spec/queries/ (25 .base files, not 26) and spec/decisions/adr-query-in-engine.md are reachable at ref "main" in this checkout, confirmed directly.
owner: the driving agent
trigger: "the harvesting sub-step of i15, using se_file_read/se_file_glob with ref set to main"
status: closed
breaks_how_badly: abrasive
how_likely: conceivable
probe: "holds, with one correction. se_file_glob (glob spec/queries/**, ref main) returns 25 files, not 26. se_file_read (path spec/decisions/adr-query-in-engine.md, ref main) returns the ADR. The operator fetched every ref before this walk; local main and v2 branches exist. The harvest source is confirmed reachable."
probed: 2026-08-16
impact: "Closed. The harvest half of i15's goal has a confirmed source — ref main, 25 .base files plus the ADR."
source_refs:
  - i15-the-database-our-own-reader-over-obsidia
---

## Resolved 2026-08-16

se_file_glob {glob: "spec/queries/**", ref: "main"} returns 25 files (not
26 — every file listed once: assumptions, constraints, criteria,
decisions-architecture, decisions-project, decisions-strategy,
decisions-waiver, force-rationales, fundamentals, ifus, interfaces, methods,
needs, neighbours, qualities, raid, rationales, references, requirements,
rules, stakeholder-matrix, tensions, usecases, vv-deck, vv-matrix).
se_file_read {path: "spec/decisions/adr-query-in-engine.md", ref: "main"}
returns the ADR. Both confirmed once the operator fetched every ref before
this walk; local `main` and `v2` branches now exist in this checkout. The
earlier refusals (SE-C-102, logged below) were a real tool-scope/ref-fetch
gap at the time, never evidence the ref was missing from history.

The 26-vs-25 discrepancy is filed separately as note-4db90de22560 — it
traces to record.md/version-planning.md's own count, not to this raid.

## Why this is open, not settled

Kickoff tried four ref names from iterations/i15/gate-kickoff, where the
only legal tools are the se_file_* family: `main`, `trunk`, `v1`,
`origin/main`. Each refused with SE-C-102, "not a valid object name".

The remedy both times named `se_run` with `git branch --all --list`, but
`se_run` is not on gate-kickoff's legal_tools list. This is a tool-scope
gap for THIS state, not evidence the ref is missing from the repository.

## What would settle it

A state where `se_run` or `se_git` is legal runs `git branch --all --list`
and `git tag --list`. Whichever ref actually holds
`spec/queries/requirements.base` is the one `se_file_glob`/`se_file_read`
should use with `ref: "<name>"` for the harvest.
