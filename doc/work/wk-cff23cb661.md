---
id: wk-cff23cb661
seq: "50"
type: work
title: two generic editors
status: imp_in_work
assignee: main
scope: single-step
traced: true
holder: main
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


THE LINE, DRAWN. This is the first thing the token said it would do, and here it
is, with what falls on each side.

THE SHELL IS THE WORK EDITOR. It knows there are two instances, which view they
are showing, and what a row dragged between them is. That is the view tabs, the
second-instance button, the seam between the two, and the one thing that carries
a dragged row, which has to sit above both because neither instance owns the
other.

AN INSTANCE IS A GENERIC EDITOR. It draws a table over one view and one pane and
everything it does is about that table: its toolbar, which is Group, Rename,
Filter, Sort, Properties and the query toggle, its three popovers, its column
heads, its pinned box, its scrolling box, its pager, its code panel, its own
ticked rows and its own folds.

A BUCKET IS THE TABLE'S AND NOT WORK'S, which is the one call in this list worth
arguing. A bucket is a person's own name for a group of rows, and any table can
have one. What makes it look like work's is that the engine refuses to let an
agent make one, and that refusal is about who may name a grouping rather than
about what a grouping is.

THE MINT ROW IS NOT ON THIS PAGE AT ALL. It lives in the panel webview,
src/extension/panel.ts, which is a different surface. It was on the list this
token wrote before anybody looked, and looking is what took it off.

THE LINE IS A CHECK AND NOT A PARAGRAPH. Every editor defect the owner reported
this week was a control on one side of it reaching to the other, and a line
nothing enforces is a line that moves the next time somebody adds a button.
drive-editor.mjs asserts three things of it: every shell control is drawn and no
instance carries one, every instance control is drawn and none is outside an
instance, and each instance has its own of every one. Watched red both ways, by
putting a second button inside a pane and by putting a toolbar on the bar.

