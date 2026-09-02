---
id: wk-cff23cb661
seq: "-11"
type: work
title: two generic editors
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-66a28ca311
minted_by: person
evidence:
  - outcome
---

## detail

The work editor is a shell that holds two instances of a generic editor, as in v3. Owner's words: today one page draws two panes called left and right that share a page rather than code. A generic editor draws a table over one view and one pane. It owns its toolbar, popovers, heads, pinned box, scrolling box, pager, code panel, ticked rows and folds. The shell owns the view tabs, the second-instance button, the seam, and the carrier for a row dragged between instances. A bucket belongs to the table, and the mint row lives in src/extension/panel.ts and is not on this page. drive-editor.mjs asserts the line: every shell control drawn outside an instance, every instance control inside one, and each instance with its own.

## evidence: outcome

In src/extension/editor.ts ticked takes the instance, countTicked answers per instance, and the two toolbar handlers resolve theirs from the button pressed. The drag carrier sits in wireDragging above both instances, and a drop from one instance onto a group in the other files the right row. util/checks/drive-editor.mjs drives ticks, the drag, and the line both ways, each watched red first, and the battery answers all ok. Drops on declared groups are wk-e4754bcd17.
