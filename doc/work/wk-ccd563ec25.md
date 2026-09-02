---
id: wk-ccd563ec25
seq: "68"
type: work
title: one pass hides rows
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "Obsolete: candidates() skips a row a folded parent took away at src/extension/editor.ts:1131, in the same pass as the other two."
aborted_from: backlogged
minted_by: reviewer4
---

## detail

editor.ts computes the two ways to hide a row, a closed group and a page it is not on, in one pass. Nesting added a third, folded-away. candidates() at editor.ts:1114 still skips only rows inside a shut group, so the pager counts rows a folded parent took away. Put folded-away into the same pass and run drawFolds before showPage. Check: set the page size so the pager is live, count visible rows, fold a parent on the page, and require the count unchanged. Reproduced in .se/scratchpad/reviewer4/drive-page-fold.mjs. Related: wk-36e19fe1fd.
