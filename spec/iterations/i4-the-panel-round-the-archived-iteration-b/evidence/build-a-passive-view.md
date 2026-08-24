---
form: build-a-passive-view
by: agent
signed_off: 2026-08-23T18:32:25.937Z
authors: agent
files:
---

# Evidence form / build-a-passive-view

## current_situation

THE TWO-HOUR BOX WAS NOT SPENT BUILDING. The surface already redraws on every look, so what it does today about a caret and a scroll IS the experiment, and it is readable.

SIX PLACES IN THE CODE KEEP SOMETHING ACROSS A REDRAW, each a separate local rule written where a redraw hurt somebody.

- basesclient.ts line 130: do not overwrite a code box while it has focus.
- editors/node-table.ts line 197: abandon a refresh entirely if the table contains the focused element.
- editors/node-table.ts line 242: blur the active element before acting.
- renderclient-detail.ts lines 114 to 117: save scrollTop and put it back when the subject has not changed.
- renderclient-log.ts lines 37, 52 and 55: stick to the top if the reader was near the top, otherwise restore the exact offset.
- renderclient-live.ts line 286 and renderclient-walk.ts line 218: do not overwrite an input or a slider while it has focus.

## built

- none

## follow_up

THE ASSUMPTION IS FALSE AS WRITTEN AND TRUE WITH ONE NAMED EXCEPTION. A surface cannot hold nothing, because a caret, a scroll offset and a focus target must survive a redraw and the engine does not know them. The six sites above are that fact, already discovered six separate times.

THE EXCEPTION IS SMALL AND CLOSED. Everything the surface must keep is in one of three shapes: which element has focus, where a pane is scrolled, and what is typed but unsubmitted.

SO THE DESIGN HAS TWO HONEST ROUTES and the spike does not choose between them.

- THE MODEL CARRIES THEM. The view model gains a focus target and a scroll offset per pane, and the surface still decides nothing. That makes the interface wider and keeps the guarantee whole.
- THE SURFACE KEEPS EXACTLY THOSE AND NOTHING ELSE. A declared, checkable exception rather than six rules discovered by pain.

EITHER WAY THE SIX AD-HOC RULES BECOME ONE. That is the finding worth carrying: today the same problem is solved six times in six files with three different tricks, and one of them abandons the refresh altogether rather than reconciling it.

THE DECISION NODE NEEDS THIS. It says the surface derives nothing, and that sentence is now known to be too strong. It should say the surface derives nothing about the walk, and keeps only what the browser holds about a person mid-action.

## anything_else

