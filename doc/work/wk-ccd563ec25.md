---
id: wk-ccd563ec25
seq: "68"
type: work
title: one pass hides rows
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: reviewer4
---

## detail

A third way to hide a row, added outside the one pass the other two share. editor.ts:1107 says it in as many words: TWO THINGS HIDE A ROW and they share one attribute, a closed group and a page it is not on; two handlers writing the hidden flag would fight, so both are computed in one pass. Nesting added a third, folded-away, and candidates() at editor.ts:1114 still skips only rows inside a shut group. So the pager counts rows a folded parent took away.

REPRODUCED in .se/scratchpad/reviewer4/drive-page-fold.mjs: set a page to 5, count the rows a person can see, get 5. Fold one parent on that page and the count is 3. The two children the fold took away are still counted against the page.

It is dormant today only because the pane reports 35 rows against a default page of 50, so the pager ships hidden. It becomes visible with no further change the moment the table passes fifty.

WHAT TO DO: put folded-away into the same pass. candidates() should skip a row hidden by a folded parent exactly as it skips one inside a shut group, and drawFolds has to run before showPage so the classes are there to read.

THE CHECK, RED TODAY: set the page size small enough that the pager is live, count the rows a person can see, fold a parent on the page, and require the count to be unchanged.

Found on wk-36e19fe1fd.

