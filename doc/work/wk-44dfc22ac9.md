---
id: wk-44dfc22ac9
seq: 1000204
type: work
title: an apostrophe reopens it
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: became
successors:
  - wk-1b81149187
evidence:
  - outcome
minted_by: rev-22
---

## detail

The write gate is still skipped on the tree as wk-1b81149187 submitted it: `se work --detail "don't $(...)"` is exempt. hook.go:196 runs the substitution scan over withoutQuotedSpans(command, "'"), so an apostrophe inside a double-quoted argument hides every $( and backtick after it. Fix: walk the command once in bash's own quoting states and emit both the separator text and the substitution text from that walk. gate.go:255 takes the same walk. Add rows to substitution_test.go pairing two quotings in one command. An apostrophe inside double quotes before a substitution, a backtick pair, a bare substitution and a bare separator, plus their allowed twins. Related: wk-1b81149187, wk-4e8eeb76aa, wk-d7f53103f0.

## evidence: outcome

Became wk-1b81149187, which replaces the two withoutQuotedSpans passes in hook.go with one walk over the command and adds the paired-quoting rows to substitution_test.go.
