---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-risk-i15-ships-without-a-live-prior-art-scan
type: "[[raid]]"
kind: risk
statement: i15's kickoff gate could not run round_1_validate's live prior-art scan, so the reader and its BM25 sibling might duplicate or fall short of what Obsidian's own Bases, the Dataview plugin, or another markdown-query tool already does well.
owner: the driving agent
trigger: the next i15 gate where a web-search tool is legal, or the owner's own comparison
status: closed
breaks_how_badly: abrasive
how_likely: expected
impact: Effort goes into a query layer or a retrieval sibling that a maintained plugin already solves better, and the gap surfaces only after the build rather than before it.
source_refs:
  - i15-the-database-our-own-reader-over-obsidia
---

## Why the scan did not run

meth-gate-review.md names `se_web_search` and `se_web_fetch` as the lane
for the live scan, but neither tool is on gate-kickoff's legal_tools list.
The native `WebSearch` tool (which the lane table in CLAUDE.md marks as
allowed) was tried twice for this round and both calls were declined at
the permission layer for this session.

## What would settle it

Run the scan at the next i15 gate where a search tool is legal or
permitted: Obsidian's own Bases plugin, the Dataview community plugin,
and one other markdown-query tool, each compared on what it does better
first, per the sycophancy guard.

## Resolved 2026-08-16

find_prior_art ran the live scan via se_web_fetch (se_web_search stayed
unconfigured; native WebSearch stayed declined at the permission layer,
so se_web_fetch against known primary-source URLs carried it instead).

Compared: Obsidian Bases (core plugin, confirmed via the Aug 2026
Obsidian changelog — formula editor, sort/filter controls, table-view
columns; `.base` files are read-only YAML view-config, no database).
Obsidian Dataview (community plugin, confirmed via its own README — DQL
pipeline query language, DataviewJS scripting mode, frontmatter plus
inline-field indexing). Fellegi & Sunter's 1969 record-linkage theory for
the disposition cluster, confirmed via its Wikipedia summary.

What ours does better first (sycophancy guard): none of the three ships
for this project's own trace corpus shape (typed nodes/edges/states/notes
across four kinds with a fixed field vocabulary per kind) — that is not a
claim of superiority, it is the reason none of the three is a drop-in
replacement. See project/spec/trace/option/opt-declarative-view-spec-
evaluated-in-process.md and its siblings for the mechanism-level findings.
