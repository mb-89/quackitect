---
form: find_by_probing
by: agent
signed_off: 2026-08-16T17:56:02.791Z
authors: agent
files: null
---

# Evidence form / find_by_probing

## current_situation

find_by_transforming closed. This is the last of seven M4 finders: build the cheapest runnable thing and find out.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| is a closed field=="value" regex grammar enough to evaluate v1's harvested filter shapes, and is it cheap | one throwaway node -e run, no file kept | 4 handwritten node objects standing in for the real corpus | matched both harvested shapes correctly in 177.9µs for 4 nodes×2 queries, correctly rejected a malformed expression; a follow-up file search then found `!=` and a boolean literal in 3 of the 25 harvested files the first pass had not checked, so the option was corrected in place to name both operators |

## options

- project/spec/trace/option/opt-closed-regex-grammar-for-filter-expressions.md

## dead_ends

- none this pass — the one probe run produced a corrected option rather than a dead end

## follow_up

All seven M4 finders have now run over cluster-the-query and cluster-the-disposition. Twenty option nodes stand across the two clusters. Next: enumerate-space dedupes/joins them into the morphological chart for M5 candidate enumeration.

## anything_else

