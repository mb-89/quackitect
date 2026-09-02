---
id: wk-10d3cf13cd
seq: "70"
type: work
title: the whole set checked
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "The lesson is written in doc/guidance/specifying.md and wk-c6247665a3 now carries one command criterion per commit, so the token is obsolete."
aborted_from: backlogged
minted_by: reviewer4
---

## detail

A criterion whose words cover a set and whose command covers one member of it. The criterion on wk-c6247665a3 asks for all thirteen commits by short name and runs rg -q 715c0a8b over the field report. A report naming three of them passes. When a criterion is about a set, the command iterates the set and fails on the first miss. Found on wk-c6247665a3.
