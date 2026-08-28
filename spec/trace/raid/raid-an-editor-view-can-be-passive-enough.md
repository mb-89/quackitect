---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-an-editor-view-can-be-passive-enough
type: "[[raid]]"
kind: assumption
statement: A surface can be redrawn from a computed view without losing what a person was in the middle of doing, so it needs to hold nothing of its own.
owner: the owner
trigger: the first redraw that loses a caret, a scroll position, a focus or an unsubmitted edit
status: open
probe: false as written, true with one closed exception — a caret, a scroll offset and an unsubmitted edit must survive a redraw, and six places in the code already keep them
probed: 2026-08-23
impact: The whole decision rests on the surface deriving nothing. A host that demands its own layout or state decisions leaves a seam the design promises to close, and the panel axis it was chosen for weakens with it.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - raid-the-surface-repeats-a-computed-view-behind-a-guard
  - spec/trace/requirement/req-panel-shows-the-machine.md
  - "graft-onto-the-winner: the graft adds an assumption the base did not carry"
---

## Why it exists as its own node

IT WAS FOUND BY A COLD REVIEW OF THE ARCHITECTURE GATE. The graft's own
re-score recorded the charge in prose — the graft adds an assumption the base
did not carry, and it bears on the panel axis the base won — and nobody minted
it. A charge that moves no score and lives only in an evidence form is a
finding with nowhere to be looked up.

## What the word meant, since it collided

IT MEANS THE EDITOR'S PANEL, not one of this project's form editors. The word
"editor" already names the checklist, the node table and the compare card, and
using it for the host's own surface put two things behind one word. The
statement above is rewritten to avoid it.

## Not established

SOME THINGS ABOUT A SURFACE ARE IN NEITHER PLACE. They are not in the markdown
and the engine does not hold them:

- where the caret sits in a text box
- how far a pane is scrolled
- which field has focus
- whether a fold is open or closed
- what is selected but not yet submitted

THOSE LIVE IN THE BROWSER'S OWN TREE while the page is on screen. A surface
that decides nothing does not hold them either, so a redraw loses them unless
the engine carries them too.

## Not controlled

HOW MUCH SURVIVES A REDRAW IS THE HOST'S BEHAVIOUR, not ours. A host that
replaces the whole tree loses all of it; one that reconciles keeps some.
Nobody here has measured which.

## Probe

REDRAW A WIDGET WHILE SOMEBODY IS USING IT.

- Render one widget entirely from a supplied model.
- Redraw it from a new model while a caret sits in it and the pane is scrolled.
- List what is lost.

THE PROBE PASSES when nothing a person was in the middle of is lost, or when
what is lost can be carried in the model without the surface deciding it. It
needs a running extension, so it is a spike rather than a script.

## What happens if it fails

THE SEAM COMES BACK. Whatever the view must decide is derived on the surface
again, and the guarantee that a surface cannot disagree with the engine
narrows to a guarantee that it mostly does not.
