---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-asm-v1-ref-for-spec-queries-is-reachable
type: "[[raid]]"
kind: assumption
statement: v1's spec/queries/ (26 .base files) and spec/decisions/adr-query-in-engine.md sit at some reachable git ref in this checkout, even though the ref name recorded in i15's own goal ("main") does not resolve here.
owner: the driving agent
trigger: the harvesting sub-step of i15, run from a state where se_run or se_git is legal and git branch/tag listing can enumerate the real ref name
status: open
breaks_how_badly: abrasive
how_likely: conceivable
impact: If the ref cannot be found at all, the "harvest, do not invent" half of the goal has no source to harvest from, and the 26 query files must be rebuilt from the prose description in record.md and version-planning.md instead of copied.
source_refs:
  - i15-the-database-our-own-reader-over-obsidia
---

## Probe

From a state where se_run or se_git is legal, run `git branch --all --list`
and `git tag --list`. Whichever ref's tree contains
`spec/queries/requirements.base` is the real name; confirm with
`se_file_glob {glob: "spec/queries/*.base", ref: "<name>"}` and expect 26
files back. If no ref anywhere in the history holds that path, the
assumption is FALSE and the harvest half of i15's goal has no source.

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
