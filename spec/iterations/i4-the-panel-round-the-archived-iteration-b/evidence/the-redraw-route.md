---
form: the-redraw-route
by: agent
signed_off: 2026-08-23T19:34:16.397Z
authors: agent
files:
---

# Evidence form / the-redraw-route

## current_situation

SIX PLACES EACH DECIDED FOR THEMSELVES what the reader's place meant, and no two agreed. One asked whether an element WAS the focused one. Another asked whether it CONTAINED it. A third blurred first and asked afterwards.

THE MODEL DOES NOT CARRY THEM, and that is the decision. Focus, scroll and an unsubmitted edit change on every keystroke. A model carrying them would need a round trip per character typed.

SO THEY STAY ON THE SURFACE — in exactly one place on it.

## built

`deliverable/engine/renderclient-place.ts` IS THE ONE DECIDER. It is the FIRST part of the client script, so every later part has it in scope, and both extra page scripts load after it.

FOUR FUNCTIONS, each answering one question:

- `sePlaceHasFocus(el)` — is the person typing in this element or in something inside it
- `sePlaceIsEdited(el)` — does this field hold an unsubmitted edit, which is the same question
- `sePlaceKeepScroll(el, redraw, opts)` — redraw and put the scroll back, with stuck-at-the-top staying stuck
- `sePlaceKeepScrollForSubject(el, sameSubject, redraw)` — keep the scroll only while the pane shows the same thing

SIX SITES NOW ASK IT:

- `basesclient.ts` line 130, the code box a redraw must not overwrite
- `editors/node-table.ts` line 197, the table a redraw must not disturb
- `renderclient-live.ts` line 286, the autonomy field
- `renderclient-walk.ts` line 218, an input inside the morph
- `renderclient-detail.ts`, the details pane's scroll
- `renderclient-log.ts`, the feed's scroll and its stick-to-top

THE CONTAINMENT CASE IS WHY IT MATTERS. `document.activeElement !== el` is right for an input and wrong for a table, and four of the six sites had it one way while two had it the other.

ONE SITE WAS DELIBERATELY LEFT ALONE. `editors/node-table.ts` line 242 BLURS before a redraw rather than preserving anything. It is the opposite act, and folding it in would have hidden that.

## follow_up

NOTHING CHECKS THAT A SEVENTH SITE DOES NOT APPEAR. A test asserting that `document.activeElement` and `scrollTop` are only read inside `renderclient-place.ts` would make this stick, and it is the same shape as the widget guard.

THE SCROLL BEHAVIOUR IS UNCHANGED BY DESIGN. Both scroll helpers reproduce exactly what the two sites did before, including the feed's forty-pixel stick threshold. This chunk moved the decision; it did not change it.

## anything_else

