---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-risk-i15-ships-without-a-live-prior-art-scan
type: "[[raid]]"
kind: risk
statement: i15's kickoff gate could not run round_1_validate's live prior-art scan, so the reader and its BM25 sibling might duplicate or fall short of what Obsidian's own Bases, the Dataview plugin, or another markdown-query tool already does well.
owner: the driving agent
trigger: the next i15 gate where a web-search tool is legal, or the owner's own comparison
status: open
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
