---
id: wk-cff23cb661
seq: "50"
type: work
title: two generic editors
status: open
assignee: main
scope: single-step
traced: true
parent: wk-66a28ca311
minted_by: person
---

## detail

The work editor is a shell that holds two instances of a generic editor.

WHAT THE OWNER SAID: in v3 these were two instances of the same editor. What is
here now is one page that draws two panes and calls them left and right, and
they do not share code, they share a page. That is why the second pane's button
does nothing that lasts, why the two keep disagreeing about what they show, and
why every control has to be told which side it is on.

THE SHAPE. A generic editor is complete in itself: it draws a table over a
view, it has its own toolbar, its own popovers, its own pager, and it talks to
the engine about its own view file and pane. Two of them sit side by side. The
work editor is the shell around them: it carries the buttons and functions that
belong to work rather than to a table, and it is what decides that there are
two.

DRAG AND DROP WORKS BETWEEN THEM. A row dragged out of one instance and dropped
in the other is the shell's business, because neither instance owns the other.

WHY THIS AND NOT MORE PATCHING. Every defect the owner has reported in the
editor this week has been one pane's control reaching into the other pane's
state through a shared page. A generic editor that owns its own state cannot
have that defect, and the shell is the only place that knows about both.

WHAT THE WORK EDITOR HAS THAT THE GENERIC ONE DOES NOT. That list is part of
the work: the mint row, the group buttons, the second-pane button, and whatever
else turns out to be about work rather than about a table. Drawing the line is
the first thing this token does, because it decides what the generic editor is.

