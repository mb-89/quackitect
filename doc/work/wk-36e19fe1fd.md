---
id: wk-36e19fe1fd
seq: "39"
type: work
title: a child draws nested
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-66a28ca311
rounds: "1"
evidence:
  - outcome
minted_by: person
---

## detail

A sub-token draws under its parent, nested and collapsible, like a group. This is a tree and not a grouping, since a parent is a link from one row to another and is itself a row. The engine has to answer a row that carries its children. The fold has to be remembered by the token id rather than a group name. A child is drawn once, even when it also matches a pinned group. Check it by driving the page. A parent with two children renders one row with two under it, folding hides both, and the fold survives new data arriving.

## evidence: outcome

A Line carries under and depth, and nest runs over the whole table after the partition. The row fold key is the pane and the id, kept in the set that survives new data. candidates in editor.ts skips a row a folded parent took away as well as one in a shut group, and folding redraws the page. TestAChildWithNoParentHereDrawsOnItsOwn, TestAChildIsDrawnOnceEvenUnderAPin and drive-editor.mjs cover it, with the pager count required unchanged across a fold.
