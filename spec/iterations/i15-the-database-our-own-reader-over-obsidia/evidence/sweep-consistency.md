---
form: sweep-consistency
by: agent
signed_off: 2026-08-19T20:49:11.494Z
authors: agent
files:
---

# Evidence form / sweep-consistency

## current_situation

run-demos is signed. This iteration changed: two new lane verbs (se_query, se_couplings) wired into the tool list, the 26 harvested .base query files plus the reader ADR, tables.ts extended test-first (file.inFolder, file.hasTag), 8 of 15 delta-default resolvers fixed, two interface entries minted, and (found and fixed during run-demos) parseBase corrected to honor a .base file own top-level filters.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

One real staleness landed and is fixed: README.md claimed 34 lane tools; the pinned test count is 38 after se_query and se_couplings, so the README now reads 38. Everything else searched clean: tools-query.ts own description strings are accurate, the two new interface entries are correctly minted, the two matrix rows for fill-story-evidence and run-demos already describe the mechanism correctly, no book folder exists yet in this project so that surface class has nothing to sweep, and no panel or form-help text names either new verb. One known-stale surface was found and left on purpose: define-actual.md still says no se_query verb exists - that is gate-kickoff own as-is snapshot from before the build, a historical record rather than a taught surface, so it stays as it was written.

## anything_else


