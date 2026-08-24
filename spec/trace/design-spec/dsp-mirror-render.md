---
minted_in: i1
id: dsp-mirror-render
type: "[[design-spec]]"
statement: the one surface a person looks at, carried by a loopback server rendering the machine, the forms, the feed and the tour
realizes:
  - "el-mirror"
  - "if-account-to-mirror"
  - "if-front-desk-to-mirror"
  - "if-holding-pen-to-mirror"
  - "if-method-compiler-to-mirror"
  - "if-record-store-to-mirror"
  - "if-walk-engine-to-mirror"
files:
  - "deliverable/engine/render.ts"
  - "deliverable/engine/renderclient.ts"
  - "deliverable/engine/renderclient-detail.ts"
  - "deliverable/engine/renderclient-walk.ts"
  - "deliverable/engine/renderclient-form.ts"
  - "deliverable/engine/renderclient-panel.ts"
  - "deliverable/engine/renderclient-log.ts"
  - "deliverable/engine/renderclient-live.ts"
  - "deliverable/engine/renderstyle.ts"
  - "deliverable/engine/mirror.ts"
  - "deliverable/engine/panel.ts"
  - "deliverable/engine/brand.ts"
  - "deliverable/engine/card-parts.ts"
  - "deliverable/engine/cards.ts"
  - "deliverable/engine/traceui.ts"
  - "deliverable/engine/gitgraph.ts"
  - "deliverable/engine/shoot.ts"
  - "deliverable/engine/bin/brand.ts"
  - "deliverable/engine/bin/mermaid-check.ts"
  - "deliverable/engine/bin/place-prompt-layer.ts"
---

## One decider says which kind of green it is

req-the-panel-s-paint-says-which-kind-of-green-it-is.

THREE RULES DECIDE WHAT A GREEN MEANS, and they were enforced by scattered
cases in three test files, so nobody could say which of them were covered.

- Green means SUBMITTED: a claim was stamped by whoever filled it.
- Green plus the thumb means BLESSED: somebody ruled on it.
- A LAW-PROVEN green is neither. No form was signed; a law passed.

THE THIRD DID NOT PAINT AT ALL. A check that RAN and a claim somebody stamped
were the same colour, which is the one distinction a reader most needs.

SO THE PAINT BECOMES ONE FUNCTION of what is known about a state, returning a
class and its marks. Suspect still beats every green, because a colour
standing on moved ground is no longer earned.

### The third kind is computed and NOT BUILT YET as anything a reader sees

THE DASHED STROKE IS GONE (owner ruling 2026-08-24). A law-proven state carried
`stroke-dasharray` and now paints exactly like a stamped one.

THE OWNER'S WORDS: "We don't have dashed states. I don't know what this is. I
want this removed."

THE RULING IS RIGHT ABOUT THE STROKE. No panel card named the dash, so a reader
met a fourth stroke in a vocabulary of three with nowhere to look it up. A
distinction nobody can read is not a distinction, whatever the renderer intended.

WHAT THAT COSTS, said plainly: the paragraph above calls this "the one
distinction a reader most needs", and right now nothing on the panel draws it. A
check that RAN and a claim somebody stamped are the same colour again.

THE DECIDER IS UNTOUCHED. `lawProvenStates` still computes the third kind, and
the paint function still returns it. Only the stroke is gone, so restoring a
readable form of it needs no new computation.

WHEN IT IS BUILT, IT WILL BE A MARK RATHER THAN A STROKE. The bless already works
that way, and a mark is a thing a reader can point at and ask about. That is the
failure the stroke had, and it is the one worth not repeating.

## Responsibility

The mirror serves what the engine holds — the machine drawing, the
evidence forms, the trace graph, the feed, the archive, the tour — to
one machine over loopback, and never advances the walk. Every seam into
it is a derived view; controls post back through the lane.

## Behavior and constraints

- Colors are configuration, read from the palette file.
- Every update reaches the render; the reader keeps their place.
- The screenshot verb captures the mirror for evidence, on request.

## Pushed, never polled

THE WALK WAKES EVERY HELD HAND and the event stream forwards that wake to the
surface, so a change lands at once instead of up to a poll late.

THE STREAM RECONNECTS BY ITSELF. A reconnect after silence is how an engine
swap arrives without a manual refresh, and a silence that never ends is death.

## The reader keeps their pane

A PANE THE READER SIZED KEEPS THAT SIZE.

Walking into a sub-state is a full page load, and a width set by dragging is an
inline style, which no page load survives. So every entry into a sub-machine
snapped the whole layout back to its defaults — the machine drawing included,
because it takes whatever the two columns leave it.

A PANE SIZE IS A PREFERENCE, NOT A VIEW OF SOMETHING. It is about how the
reader likes to work, not about which machine is on screen. So it outlives the
tab, while the per-machine viewBox belongs to the session, where a view of one
drawing belongs.

## The loading bar owns its lifetime

ANYTHING THAT CAN TAKE LONGER THAN A SECOND SHOWS FEEDBACK AT ONCE.

THE BAR USED TO RELY ON THE NAVIGATION THAT FOLLOWED to replace the whole page.
Morphing then replaced navigation, and a bar nobody hid simply stayed up.

A BAR THAT OUTLIVES ITS LOAD IS WORSE THAN NONE: the reader learns to ignore
it, and it can no longer warn them when something really is slow. So every load
carries a token, settles exactly once, and cannot outlive its deadline.

## The terminal flicker was a 2-cycle

THE FIRST FIX REFUSED A RESIZE THAT CHANGED NOTHING, which only ever catches a
fixed point. The real loop alternated between two sizes, so every step differed
from the one before it and the guard never fired.

WHAT DROVE IT: the client width INCLUDES the pane's padding, so the grid was
computed about three columns too wide. The terminal laid out wider than its
content box, the pane grew a scrollbar, the client width shrank, the grid
narrowed, the scrollbar went away, and it started again.

THREE GUARDS, EACH KILLING ONE LINK. The pane no longer scrolls, so a child
cannot change the parent's client box. The grid is measured against the CONTENT
box, so the terminal fits what it was given. And after our own resize the
observer is ignored until the relayout has landed, with one trailing look so a
drag ending inside that window is not lost.

## The native skin

DOCKED INSIDE A HOST, THIS IS NOT OUR OWN WINDOW ANY MORE, so it stops looking
like one: square corners, the host's fonts, the host's palette. Our own look
belongs to the standalone mirror. Semantic colours stay ours everywhere.

A SOLO CARD DROPS ITS HEAD AND ITS FRAME. The host already draws a titled,
bordered pane around it, and two frames read as a bug.

THE HOST OWNS THE WALK'S CONTROLS WHEN EMBEDDED. The dials and the escape steer
the whole walk and a card may be closed, so they belong to the host's sidebar
rather than to any one card.

THE CRUMBS ARE NOT CONTROLS. They navigate the DRAWING — which machine is on
screen — so they stay with the drawing. Escape stays with the drawing too, and
lives only there: it acts on the walk the drawing shows, and repeating it in
the host's sidebar would be the same control in two places.

## A walked sub-machine must not look unstarted

A CONTAINER AND AN END CARRY NO CLAIM OF THEIR OWN, and the live run that used
to colour them dies with the engine. Read from trunk, a finished record showed
"not done" though every claim under its last gate stood signed. So their green
is DERIVED.

A CONTAINER'S GREEN IS THE SESSION'S, NOT THE RENDERER'S. The session already
answers for it, and it answers with the ripple applied — so a container whose
own inputs are grey stays grey. Painting it here from its interior alone was a
second rule, and it drew one machine green above a grey dependency.

## See your own diagram

SEE YOUR OWN DIAGRAM. Mermaid fails at RENDER time, not at write time, so
a diagram can pass every test we own and still show a parse error in the
pane. That happened twice: a branch name with a space, and a config change
that made the graph worse in ways no assertion could describe.

This wraps every mermaid fence in a markdown file into a page that renders
them and REPORTS FAILURES IN THE TITLE, so a screenshot answers both
questions at once — did it parse, and is it readable.

SELF-CONTAINED, BY RULE (owner ruling 2026-08-09). This page used to load
its renderer from a CDN on every open — a standing dependency on someone
else's server to run our own tooling, which the dependency rule forbids:
pull an asset once, never lean on a server running our work. The renderer
is vendored (vendor/mermaid) and INLINED, so the page works offline,
forever, as generated. A missing vendor file refuses at GENERATION time
with the pull that fixes it — there is no online fallback on purpose.

## The cards shared pieces

THE CARD'S SHARED PIECES — one panel builder, one button style, used by
every one-question-at-a-time editor. compare-card drew these first; the
sensitivity deck reuses them by interpolation instead of rewriting them
(owner ruling 2026-08-10: rework the existing editor, never a second copy).

This is CLIENT SOURCE, interpolated into a render string. In scope where
it lands: escText, paths, facts. No backtick inside.

## The cards the mirror shows

THE CARDS THE MIRROR SHOWS — one big card beside a two-wide grid.

The list is PER PRODUCT, not per engine (owner ruling 2026-07-29). v3 is
meant to work on other products, and another product wants other cards. So
the truth is deliverable/views/cards.md, edited in Obsidian.

NESTED FRONTMATTER, by the owner's call. Obsidian's own Properties panel
collapses nested YAML into a blob, but the Nested Properties community
plugin renders it as a tree — and this vault already requires Advanced
Canvas to draw machines, so the plugin bar was paid long ago.

ENTRY ORDER IS THE NUMBERING. A card that is not built yet keeps its entry
and its number — dropping it would renumber every card after it, and the
numbers are muscle memory.

## The decision graph is not a tree

THE DECISION GRAPH IS NOT A TREE, and drawing it as one loses the only
interesting part. walking.md defines a fork as "a BLOCKING detour: the
current item cannot continue until this is fixed; resolve it and RETURN".

So the graph emits as a Mermaid gitGraph. VS Code renders Mermaid in its
built-in Markdown preview since 1.121, so nothing here needs a renderer.

THE SHAPE (owner design, 2026-07-31):

- The trunk is the checklist. One commit per point, top to bottom.
- The updates on a point become a BRANCH off it, and that branch does not
  come back. Work reported on a point is not a detour that returns; it is
  the story of that point, and merging it would draw a return that never
  happened.
- The LAST update is the one that settled the point, so it carries the
  closing mark. The trunk bubble carries it too, so the checklist reads
  straight down without following every branch.

## The persons pull

THE PERSON'S PULL (owner design 2026-08-04): the same five
instructions the agent gets, on the human channel — no slider gate,
no reading loop; checkboxes are the person's proof. The answer is
logged, and last_pull points every surface at it.

## The mirror is pushed

THE MIRROR IS PUSHED, NOT POLLED (owner ruling 2026-07-28). The
walk already wakes every held hand; this forwards that wake to
the page. The wait's timeout doubles as the re-check for things
that grow without moving the walk, like the log.

## The mirror binds loopback and says so

LOOPBACK ONLY, AND SAID EXPLICITLY (req-mirror-stays-on-the-machine).

`listen(port)` with no host binds EVERY interface, which is not what the
comment on the alive endpoint claimed and not what anybody intended. The
mirror serves the whole record — the call log, every evidence form, every
decision, the terminal — with no authentication anywhere, because the
design assumed one machine. On a shared network it was readable by anyone
on it.

FOUND BY THE ISO 25010 CHECKLIST, not by a review. Security had no quality
row because nobody thought this product had one; asking all nine
characteristics in full is what turned it up (owner design 2026-08-07).

## A failed spawn arrives as an event

A FAILED SPAWN ARRIVES AS AN EVENT, NOT AS A THROW. The try/catch
below it only ever caught synchronous failures, and ENOENT is not
one: node reports a missing binary by emitting "error" on the child
on a later tick, so with no listener it surfaced as an UNCAUGHT
exception and took the engine down with it.

That is what a headless Linux box does every time — it has no
xdg-open — so the server died on startup, respawned on the next
request, and died again (first run on a second machine,
2026-08-12). The file's own promise is that the lane never dies over
a window; this is that promise actually kept.

## A long edge routes around the band

A LONG EDGE ROUTES AROUND THE BAND (owner rule 2026-08-04): when other
 nodes stand vertically between the two, the line detours through up to
 two OUTSIDE waypoints — beside the source, then straight down beside
 the target — at 100px past the widest in-between node on the chosen
 side. A waypoint that would land inside its own endpoint is skipped.

## The drawing is the truth

THE DRAWING IS THE TRUTH, SIZE INCLUDED (owner ruling 2026-07-28).

 The render used to compute its own box sizes, because a label needs less
 room than a note and the drawing scales to fit its pane. That made the
 render and Obsidian look nothing alike, and it meant a size the owner
 fixed in Obsidian was overruled on the way to the screen.

 So the render now takes the geometry VERBATIM — position and size both.
 Fix it in Obsidian and it is fixed here. A node is instead born at the
 size of its label (canvas.nodeSize), which is a starting point a person
 adjusts, not a size anything re-imposes later.

THE ROUTE, REDUCED TO ONE DRAWING (owner design 2026-07-29). The walk's
 route is a list of qualified hops; a canvas shows one machine. So each
 hop is projected onto the machine being VIEWED, giving the ORDERED stops
 the line runs through:

 - both ends land on different states here — both are stops on the way;
 - both ends land on the SAME state here — the route is running around
   INSIDE it, so that state is a WAYPOINT. Navigation systems put a point
   on the line for somewhere you pass through, and a submachine entered
   and left again is exactly that. Click it to zoom in.
 - neither end is here — the hop belongs to another drawing.

 A stop that is not a waypoint carries NO mark. The line runs through its
 anchor all the same, which is what the owner called an invisible waypoint.

## Two different facts

TWO DIFFERENT FACTS, and conflating them threw the reader back to main
(owner report 2026-08-08). A state IS a sub-machine — that is the double
border, and it is true whether or not the drawing exists yet. A state can
be ENTERED only when its drawing resolves; a seeded one has none until the
authoring state has run.

Double-clicking an unseeded one now does NOTHING, which is the honest
answer. It used to navigate to a view that could not be found, and the
resolver quietly served the main machine instead.

## The route is drawn over the nodes

THE ROUTE IS DRAWN OVER THE NODES (owner ruling 2026-07-29), reversing
the along-the-edges ruling of the same day. Riding the edges read as the
graph highlighting itself; a navigation system lays its line ON the map.
It is pushed LAST so it covers the boxes, exactly as a route does.

ARRIVED MEANS CLEAR: with fewer than two stops there is no way left to
show, so neither line nor arrow is drawn.

## A road closure

A ROAD CLOSURE (owner ruling 2026-07-29). The route already knows the hop
the walk cannot pass — usually a state sitting above the autonomy dial.
Drawn as one unbroken line the map says the whole way is open, which is
the one moment it lies. So the line runs normally up to the closure and
FADES past it: the way exists, it is shut.

## The busbar is structure

THE BUSBAR IS STRUCTURE, NOT ROUTE (owner ruling 2026-08-04): a state
collects ALL its inputs, so every multi-feeder state draws its feeders as
taps into a collection bar wearing the AND icon — one line drops from
the bar into the state, and the individual feeder arrows disappear.

## The word is the whole truth

THE WORD IS THE WHOLE TRUTH, and the number never reaches a reader
(owner ruling 2026-08-18). A record written before the cut-over carries
no word and says so, rather than falling back to the number
(req-autonomy-is-categorical).

## The unified feed

The unified feed: this session's acts, capped at the newest 500 rows —
 the cap is declared in the result, never silent. Pending strays from
 EARLIER sessions ride on top (type "note"), so the inbox never falls
 out of sight; this session's notes already ride as se_note calls.
A FEED ROW IS ONE LINE, ALWAYS (owner ruling 2026-07-31). Note text is
 free prose with paragraphs and list items, and slicing it without
 flattening let every newline through - one note could stand a dozen rows
 tall and push the rest of the feed off the screen.

 ONE RULE, NOT ONE PER KIND. briefFor returns whatever each tool's line
 should say and NOTHING else: no flattening, no truncating, no per-case
 cleverness. Every row leaves through here, so a new tool cannot forget
 the rule and se_run no longer carries its own private version of it.
 Change FEED_BRIEF_CHARS to change the width; it is the only place the
 number lives.

THE UNIFIED FEED (owner ruling, v2 i9 notes; built in v3): every hand's
act, one line each — time | src | brief | result. Updates bold, notes
italic, refusals red. Click a line: the full record (request first, then
response, one combined object) in details; an update line: the decision
graph of its state visit.
THE QUOTE IS THE ONE THAT MATTERS, because almost every use of this is an
ATTRIBUTE (owner, 2026-08-09). A value carrying a double quote closed the
attribute early and the rest became stray markup: a candidate whose name
read "Derived house" rendered value=""Derived house"", so the browser saw an
EMPTY value and drew the placeholder. The box looked unfilled and the note
was fine all along.

## The server acting on its own behalf

THE SERVER ACTING ON ITS OWN BEHALF, not a person acting through it.

 `mirror_slow` is the mirror timing its own request. `mirror_narration_now`
 is a poll asking whether narration is due. Nobody clicked either one, and
 labelling them "human" put fifty-two acts in the feed that the owner never
 performed (owner, 2026-08-09: "they are not triggered by me… don't call it
 human").

 THE NAME IS A WEAK PLACE TO DECIDE THIS, and this list is the weakness: a
 new server-side mirror tool defaults to "human" until somebody adds it here.
 The sound fix is to stamp the actor where the call is MADE — mirror.ts knows
 perfectly well which handler a body arrived on — and carry it on the log
 record. See the note filed with this change.

## The palette is configuration

THE PALETTE IS CONFIGURATION, NEVER CODE (owner ruling 2026-07-30). Every
colour the product chooses lives in deliverable/brand/palette.css, beside the other
product configuration, where a person edits it without touching code. It is
read on EVERY render, so an edit shows on the next page load and the engine
never restarts for a colour.

THE FALLBACK IS A LEGIBILITY FLOOR, NOT A SECOND PALETTE. It carries only
what keeps a page readable when the file is gone — something to draw on,
something to draw with. Copying all fifteen values here would put every
colour in two places, and the copy would go stale the first time somebody
edited the real one.

Nothing renders from this in a working install: preflight refuses to go
green without deliverable/brand/palette.css, so a tree reaching here is already
known-broken and only has to stay readable enough to say so.

## The look files are configuration, not code

THE LOOK FILES — configuration, not code (owner ruling 2026-08-07). Read on
 every render, so an edit shows on the next paint and nothing restarts.

 WHY A CSS FILE AND NOT A CONFIG FORMAT: the values ARE css. The drawing
 reads them back with getComputedStyle, so one file drives both what the
 browser paints and what the client script computes. A json file would have
 needed a second road into the page and a second name for every value.

 A MISSING FILE IS NOT AN ERROR. Every value it sets has a default in the
 stylesheet it overrides, so the drawing stands without it.

## The left column is sized for an eighty-column terminal

THE LEFT COLUMN: the feed on top, the agent's terminal beneath it.
     SIZED FOR AN 80-COLUMN TERMINAL (owner ruling 2026-07-28). 820px was
     too wide; narrowing it without sizing the terminal would just have made
     the agent wrap early. 80 columns x 8px + 10px for the scrollbar = 650.
     8px is the UPPER bound for a 13px monospace cell, so 80 is a floor here,
     never a target. The divider moves it, and the size the reader lands on
     is stored and reused from then on.

## The terminal fills its card

THE TERMINAL FILLS ITS CARD (owner 2026-07-29), superseding the half-a-
     column rule the old left column needed. It once sat tiny because flex:none
     with no height sizes to CONTENT; in the grid the card decides the box and
     the terminal takes all of it. Still no max — promoted, it gets the big
     slot, which is far more room than the splitter ever gave it.

## The form editors read as quiet tables

THE FORM EDITORS read as quiet tables: bordered row groups, borderless
     inputs on the theme's own surface — never a white browser box.
SAVE AND REVERT ARE THE TWO ACTS AN EDITOR OFFERS, so they look like acts
     (owner, 2026-08-09). Drawn transparent on a dark panel they read as
     decoration, and the owner could not find them. Save carries the accent
     filled; revert carries the same accent as an outline, because undoing is
     not the thing you are being invited to do.

## The node table draws its structure on the elements

THE NODE TABLE draws its structure on the ELEMENTS (ux.md), because a
     stylesheet only aligns what it reaches. What is left here is cosmetic:
     nothing below decides where anything sits.
A PICKER'S LIST IS DRAWN BY THE BROWSER, and left alone it comes back
     white on a dark panel (owner, 2026-08-09). The face is styled where it is
     built; the OPTIONS can only be reached from here.

## The card matrix

THE CARD MATRIX (owner design 2026-07-29). One BIG card beside a two-wide
     grid of the rest. It is ONE grid across the whole viewport, so promoting a
     card is a class change and nothing ever moves in the DOM — a moved widget
     is a recreated widget, and a recreated terminal loses its scrollback.

THE CARD MATRIX (owner design 2026-07-29). The card list and its ORDER are
the product's, in deliverable/views/cards.md — v3 exists to work on other products,
and another product wants other cards.
EMBEDDED, the console card leaves (owner ruling 2026-07-30): the host's
integrated terminal is where the agent lives, and a second picture of it
beside the editor is an echo. The grid closes over the gap.

## Done is green where a record stands behind it

DONE IS GREEN where a RECORD stands behind it (owner ruling 2026-08-04,
     reversing the no-done-colour rule of 2026-07-31): a signed — and, for a
     gate, blessed — stored claim paints its state. States without records
     never enter the done set, so they stay uncoloured as before.

## Suspect has no rule of its own

SUSPECT HAS NO RULE OF ITS OWN, and that is the ruling (owner,
     2026-08-05). No verdict looks like no verdict. Whether a step was never
     walked or was passed against a question that has since changed does not
     matter to the reader — either way there is nothing to trust yet, so the
     colour simply goes and the plain state card is what remains. The class
     stays because the details panel and the tooltip still say WHY.

## Past a branching point the line means two different

PAST A BRANCHING POINT THE LINE MEANS TWO DIFFERENT THINGS (owner design
     2026-08-07), and drawing them the same was a lie.

     AND — every leg must be walked, so every leg is drawn SOLID. The route
     does not choose between them; it owes all of them.

     OR — one leg is the answer, so the legs behind the decision are DASHED.
     A dashed line reads as a way that exists and was not taken, which is
     exactly what it is.

## The visit to-dos

THE VISIT TO-DOS (owner design 2026-07-27): clicking a state shows,
below its details, one collapsed fold per visit; every item names its
ORIGIN (planned here | deferred from X | fork). Parked points that have
not arrived yet get their own fold.

## A lane tool is offered per state, never as chrome

No arguments — it just answers. It lives HERE and nowhere else (owner
ruling 2026-07-28): human-runnable lane tools are offered through the
legal-tools links, per state. None of them earns bespoke chrome. It had
its own header button, which the owner never found among the crumbs, the
slider and the escape control sharing that row.

## The walk stands in several states at once

THE WALK STANDS IN SEVERAL STATES AT ONCE, and has since the first fan
shipped (owner ruling 2026-08-08). The active field is a LIST, so every
standing-here test reads the WHOLE list. standingAt() below is the one way
to ask, and reading the first entry would highlight one leg of a fan and
look completely normal doing it.

## The check is the readers proof

THE CHECK IS THE READER'S PROOF, AND IT IS PER VERSION — an edited doc
unchecks itself. A doc named by a CONDITION is not always in that state's
own pulled list, and looking it up only there left the box permanently
unchecked however often it was clicked (found live 2026-07-30). The
session's checked list is the truth, and it is already version-scoped.

## The page updates in place

THE PAGE UPDATES IN PLACE (owner ruling 2026-07-28). A full reload cost
the reader their scroll, their selection and whatever they were typing.
The old workaround carried the view, the open pane and the open folds
through the URL and still lost the rest. Now an unchanged node is never
replaced, so there is nothing left to restore.

Subtrees the CLIENT fills carry data-morph-ignore. The server sends them
empty, so morphing into them would wipe what the client just rendered.

## The reader keeps their place

THE READER KEEPS THEIR PLACE (owner ruling 2026-07-28, extended 2026-07-29).
Changing WHICH MACHINE is on screen says nothing about what they had open
beside it, nor about which card they had promoted. A view URL carrying only
the view throws both away.

The card half was missed because the card matrix landed after this rule did: the
detail param was carried, the card param did not exist yet, and nobody came
back. Entering a sub-state demoted the machine out of the main slot under
the reader's hand.

EVERY pinned place goes through here, so the next one added is carried by
construction rather than by somebody remembering.
THE READER'S PLACE, DECLARED ONCE. Every surface the reader can put
somewhere gets ONE entry here. The card bug happened because this list
lived in people's heads and in three separate hand-written copies: detail
was carried, card arrived a month later, and the two never met.

Add a param here and every navigation carries it by construction. A test
refuses any param the client pins that is not registered.
Embedded in a host (the VS Code webview): the flag arrives on the iframe
URL and rides every navigation, so the server keeps serving the embedded
card set instead of resetting to the standalone one.

## A popped-out card is a snapshot

A POPPED-OUT CARD IS A SNAPSHOT (owner ruling 2026-07-29). Two things
were wrong with the pop-out, and they are separate.

It carried NOTHING. The button holds a URL baked in when the page was
drawn, so the new tab asked for "the details card" with no subject named
and the server answered with its own default. Meanwhile the live card was
showing whatever the reader last clicked, which lives only in this
browser. A reader looking at an answered question got a state.

And it must not follow the walk. The reader pops several out to compare
them side by side, so each one holds what it was opened on. Frozen means
no event stream and no refresh, ever.

## The stylesheet morphs too

THE STYLESHEET MORPHS TOO (found live 2026-07-29). It lives in <head>,
which the morph never touched, so a tab open since before a CSS change
kept the OLD sheet for as long as it stayed open. Anything shipped after
that matched no rule at all — and an unstyled SVG path fills black.
The reader saw it; the agent, on a fresh tab, could not reproduce it.

## The state forms sheet

THE STATE FORM'S SHEET (owner rulings 2026-08-04): boxes from the A3
shape, fields with their template chips, the existing save/confirm/done
buttons, plus the portable copy's export and ingest.
A [[LINK]] IS A LINK, NOT A SPELLING. Escaped prose with double brackets
left in it teaches the reader a filename and makes them go find it, which
is exactly the work a pointer exists to save.

UNRESOLVED STAYS PLAIN. A name with no path is written without brackets
rather than as a dead link, because a link that does nothing is worse than
a word: it invites a click and spends it.
NO REGEX HERE, and the first cut of this function is why. It was written
as a split on /([[[^]]+]])/ and ARRIVED at the page as /([[[^]]+]])/ —
every backslash eaten in transit, leaving a matcher that matches nothing.
The brackets rendered literally and no link ever appeared.

The warning was already in this file, twenty lines down, from the last time
it happened. Two string searches cannot be eaten.

## The editor is the templates shape

THE EDITOR IS THE TEMPLATE'S SHAPE (owner ruling 2026-08-04): a list
edits as rows, known items as labelled rows, a choice as its dropdown
with the rationale beside it, findings as answered pairs. Free text
stays a textarea. Stored forms stay markdown lines either way.

## The artifact opens in the editor

THE ARTIFACT OPENS IN THE EDITOR, AND ONLY THERE (owner, 2026-08-05).
Rendering it in details as well cost the reader the pane they were
reviewing from — two surfaces answering one click, and the one they
still needed was the one that got replaced.

## The machine rides inside the key

THE MACHINE RIDES INSIDE THE KEY, exactly as form keys carry it
(owner report 2026-08-09: a popped-out details window has its own
view — usually the walk's — so a bare state id re-resolved THERE and
build_chart's details opened as gate-candidates).

## What stands open

WHAT STANDS OPEN, for the person's own hand, now rides the LEGAL TOOLS
links like every other human-runnable tool (owner ruling 2026-07-28). It
had a button of its own in the machine header; the owner never found it
there, sharing a row with the crumbs, the slider and the escape control.
/api/survey stays — the mirror's own surfaces still ask it directly.

## Reaching end stops the session, and the window says so

SESSION OVER — anybody reaching end stops the whole session. The mirror
tries to close its window; where that is not allowed, the big red
message stands (owner ruling 2026-07-26).
THE WINDOW STAYS OPEN, AND IT SAYS SO (owner ruling 2026-07-28). This used
to try to close its own tab, which is exactly why the end was never seen:
quitting at the console left a page that either vanished or sat there
looking perfectly alive. Nothing closes itself now. The page reports.

Losing the link is not the same as reaching end, and the two no longer
share one sentence. A dropped connection says so AT ONCE, because silence
reads as breakage; only a silence that outlasts an engine reload is death.

## Only record-backed states paint

ONLY record-backed states PAINT (owner ruling 2026-08-04): the green
set is the record's standing claims, which outlive the engine life.
Session-walked states elsewhere stay uncoloured, as ruled 2026-07-31.
GREEN MEANS SUBMITTED (owner ruling 2026-08-11): the paint uses the
paint-mode green, where a signed gate stands before its bless and the
bless rides as the thumbs-up mark.

## Drift is computed on the way to the screen

DRIFT IS COMPUTED ON THE WAY TO THE SCREEN (owner ruling 2026-08-05):
green must mean still green NOW, so the demand diff is recomputed on
every look rather than only when a pin is rewritten. It costs one hash
of the matrix (~3ms) against a render measured in hundreds. A view
never writes — the reopen is the walk's, in Session.driftReopen.

## The shutdown control is gone

THE SHUTDOWN CONTROL IS GONE (owner sketch, 2026-08-01). It was redundant:
the only setting anyone wanted is "do not shut down while work is running",
and that is not a preference. The MACHINE decides it, from whether the walk
is idle at the front desk — not the agent, and not a slider.
THE UPDATE CADENCE — how often the agent OWES a line about what it is
doing. Same grammar as the other two bars; the top notch owes nothing.

## The way home when the view holds still elsewhere

The way home when the view holds still elsewhere: the header names
the walk's position; clicking it jumps the view there.

ONE BUTTON PER STANDING STATE (owner ruling 2026-08-08). A fan puts the
walk in several states at once, and naming the first of them would read
exactly like standing in one. Five buttons is what five legs looks like.

## The agents terminal

THE AGENT'S TERMINAL. The whole widget is morph-ignored: a morph that
reached into a live terminal would wipe its scrollback and its focus.
The pty host is a SIBLING process started by RUNME — the mirror only
renders a client for it, because this page's process is the agent's
grandchild and a grandchild cannot own its grandparent's terminal.

THE PANE FOLLOWS THE HOST, NOT THE LAUNCH (owner ruling 2026-07-28). It
ships hidden and the client reveals it when the host answers. Manual mode
starts none, and --own-terminal leaves the agent in its own window, so
both simply never reveal it — one rule instead of a flag for each case.
On its OWN page the pane stays visible, so a direct visit can say why it
is empty rather than showing a blank tab.

## The chat card keeps its slot

THE CHAT CARD KEEPS ITS SLOT (owner 2026-07-29), superseding the older
rule that the pane ships hidden until a host answers. An agent can connect
or drop MID-SESSION, and a card that vanishes renumbers every card after
it — under the reader's hand, while they are using the numbers.

## A container puts one here

A CONTAINER PUTS ONE HERE. Every Playwright image lands its Chromium
under PLAYWRIGHT_BROWSERS_PATH, and /opt/pw-browsers is that path on
the cloud runner. Measured 2026-08-17: the box had a working Chromium
this list could not see, so three tests went red on a machine that had
exactly what they asked for.

## Root needs --no-sandbox and only root

ROOT NEEDS --no-sandbox, AND ONLY ROOT (measured 2026-08-17). Chromium
refuses outright as uid 0 — "Running as root without --no-sandbox is not
supported" — and a container runs as root, so the whole cloud path was
shut. CONDITIONAL DELIBERATELY: passing it unconditionally would weaken
a desktop run, which has a sandbox worth keeping.

## The client script is served in parts

THE MIRROR'S CLIENT IS ONE PROGRAM. It is two thousand lines of JavaScript
that never runs in the engine, carried as a string and served with the page —
no bundler, no build step, no nonce.

IT IS WRITTEN IN SIX PARTS AND JOINED IN ORDER: the details pane and the DSM
editor, the walk's own surfaces, the forms, the panes and cards, the log and
decisions, and the live signals. Nothing else joins them.

THE PARTS ARE NOT MODULES. A declaration in an earlier part is in scope for
every later one, because the joined result is a single script with a single
scope. Order is therefore load-bearing: reordering the parts would move a
top-level statement past the thing it runs against. The split is where a
reader looks, not a boundary the program can see.

WHAT THIS MEANS FOR A GUARD. Anything reading the client's source must read
all of the parts. mirrorSource() names them, which is why a guard survives a
further split instead of quietly checking a fraction of the script.
