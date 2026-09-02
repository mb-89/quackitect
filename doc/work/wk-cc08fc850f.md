---
id: wk-cc08fc850f
seq: 1000184
type: work
title: the page counts twice
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
minted_by: main
submitted_by: main
evidence:
  - outcome
---

## detail

The work editor's group counts add up to twice the number of tokens, because a row is drawn under every query that matches it. util/views/work.base declares yours, here, backlogged and one group per state as projections, and Render in src/engine/view.go already sets Total to the distinct row count. src/extension/editor.ts carries Body.total and draws it nowhere. Owner ruling: the number is the count of tokens, not of memberships, and a row still appears under every matching query. Draw the distinct total where a person reads it first and mark a projection's count as a projection rather than a part.

## evidence: outcome

theRule in src/extension/editor.ts draws the rule between the two halves carrying the table's own total, read from panes[i].table.total and never typed. Two assertions in util/checks/render-check.mjs were watched red first: the rule carries the distinct number of rows, and the bucket groups add up to that number. bash util/checks/battery.sh answers all ok, and the toolbar still carries no number.
