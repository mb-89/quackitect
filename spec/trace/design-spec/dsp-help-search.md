---
minted_in: i8
id: dsp-help-search
type: "[[design-spec]]"
statement: A plain-words keyword search over the lane's tools and guidance, with every miss appended to a durable ranked demand log, carried by engine/help.ts and registered onto el-walk-engine's dispatch table in engine/tools.ts.
realizes:
  - el-walk-engine
files:
  - "deliverable/engine/bm25.ts"
  - deliverable/engine/help.ts
  - deliverable/engine/tools.ts
---

## Responsibility

Answers `se_help {query}` with the lane's tools and guidance pages ranked by word overlap against the query, and `se_help {demands: true}` with every logged miss grouped by shape, most-demanded first. Does not attempt synonym or stem matching, does not replace reading a tool's full schema, and does not search the codebase or the web — those stay se_file_search and se_web_search's job.

## Interface

`searchHelp(root, query, tools)` — takes the live assembled tool catalog (session, expedition and core tools; the caller passes it because only buildServer has the full set assembled) and returns ranked matches plus a miss flag. `rankDemand(root, limit)` — reads the demand log and returns it grouped by shape. Both are dispatched from engine/tools.ts's `se_help` handler, over the same MCP call path every other tool uses.

## Behavior and constraints

Scoring is plain case-folded word-overlap count (`overlapScore`), against each tool's name/title/description and each guidance doc's path/statement; top 10 matches, snippets capped at 160 characters. A query with zero matches is a miss: it is appended to `.se/help-demand.jsonl` before the call returns. Two misses whose words are the same set in a different order share one demand shape (`demandShape`: lowercased, sorted, joined). A torn line in the demand log (a crash mid-append) is skipped, never crashes the rank.

## Rationale

record.md's own vision names the search half as weaker than v2's, since this harness already loads tool schemas on demand — so it earns no more machinery than the miss log needs to have something to log against (raid-risk-se-help-search-half-unproven). No ADR was minted for the scoring choice (record-adrs, this iteration): its risk is already carried at corrosive grade by that register entry and by raid-asm-help-query-vocabulary-overlaps, below the crippling floor a decision entry needs.
