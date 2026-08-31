---
id: wk-cff23cb661
seq: "-11"
type: work
title: two generic editors
status: imp_submitted
assignee: main
scope: single-step
traced: true
disposition: done
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

## evidence: what was built

The two panes are two instances of one generic editor, and the shell is what knows there are two.

THE LINE IS DRAWN AND IT IS ON THE TOKEN, under THE LINE, DRAWN. The shell owns the view tabs, the second-instance button, the seam, and the one thing that carries a row dragged between instances. An instance owns its toolbar, its three popovers, its heads, its pinned box, its scrolling box, its pager, its code panel, its ticked rows and its folds.

TWO CALLS IN THAT LIST ARE JUDGMENTS AND I WANT THEM JUDGED. A bucket is the table's and not work's, because a bucket is a person's name for a group of rows and any table can have one. What makes it look like work's is the engine refusing to let an agent make one, and that is about who may name a grouping rather than about what a grouping is. And the mint row is not on this page at all: it lives in src/extension/panel.ts, a different webview. It was on the list this token wrote before anybody looked.

WHAT ACTUALLY CHANGED IN THE CODE, and it is smaller than the token expected because the markup was already per-instance. paneHtml has always drawn a complete editor. The sharing was in the script: ticked() read tr.ticked out of the whole document and countTicked() wrote the same state into every toolbar. So a row ticked in the left instance lit the right instance's Group button, and pressing it filed the left instance's row. ticked takes the instance now, countTicked answers per instance, and the two toolbar handlers resolve theirs from the button that was pressed.

THAT IS THE CLASS BEHIND EVERY EDITOR DEFECT REPORTED THIS WEEK: one pane's control reaching into the other's state through a shared page. An instance that owns its own state cannot have it.

DRAG AND DROP BETWEEN THEM ALREADY WORKED AND NOW IT IS PROVED. What carries the dragged row sits above both instances, which is what the shell owning it means. Driven: a row out of the first instance, a drop on a group in the second, and the file message carries the first instance's row and the second's group.

EVERY CHECK WAS WATCHED RED, in a DOM of its own so the presses above do not decide what it sees.

  the instance owning its ticks, against the code as it stood:
    FAIL and leaves the other instance's Group button hidden
         the other instance offers to file a row it does not have
    FAIL and pressing the other instance's Group sends nothing
         it sent {"type":"group","ids":["wk-4e8eeb76aa"]}, filing a row from the other pane

  the shell carrying the dragged row, with the carrier moved inside wireDragging:
    FAIL a row dragged out of one instance and dropped in the other is filed there
         it sent {"type":"group","ids":["wk-4b67d7126a"]} instead

  the line, both ways, by putting a second button inside a pane and a toolbar on the bar:
    FAIL and no instance carries one
    FAIL and every one is inside an instance

AND ONE THING THE DRAG CHECK FOUND. No group in this tree takes a drop at all. The view declares a group per status, a declared group takes its rows before the grouping level runs, so a bucket draws nowhere and there is no drop target on the page. A declared group correctly takes none, because dropping onto backlogged would write a status and a status is moved by a pull. That is wk-e4754bcd17, minted backlogged with the measurement and with where the line probably falls, because it wants agreeing before it is built.

SO THE CHECK BUILDS ITS OWN TARGET rather than waiting for the tree to supply one. A check that waits for the tree to supply its case is a check that goes quiet, and this project has been bitten by that twice this week.

The whole battery afterwards: all ok, fourteen lines.

WHAT I HAVE NOT DONE, and it is worth your eye rather than mine. The instances share one page and therefore one script, so an instance is a scope by discipline rather than by construction: nothing stops the next handler from reaching across. Making it a class with its own elements would stop it by construction. That is a larger change to a file that draws a page, and every defect in it this week was found by somebody looking at it rather than by a check.

