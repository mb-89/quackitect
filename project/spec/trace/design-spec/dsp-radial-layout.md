---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: dsp-radial-layout
type: "[[design-spec]]"
statement: the trace drawn as deterministic geometry — a wedge per value prop, a ring per level, and one named rule where a layout library would have been
realizes:
  - "el-mirror"
files:
  - "project/deliverable/engine/trace.ts"
---

## Responsibility

The trace graph, drawn radially. The vision sits at the centre. Every
selected value prop takes a wedge of the 360 degrees, and the trace levels
are concentric rings outward from it.

This document holds the DRAWING. The corpus loader that feeds it is
[[dsp-trace-corpus]], and the surface that renders the result is
[[dsp-mirror-render]]. All three touch `trace.ts`; only this one is about
where a card goes.

## No layout library

THE ARRANGEMENT IS DETERMINISTIC GEOMETRY — an angle per wedge and a radius
per ring. Nothing is solved at run time and nothing is loaded.

What a library would have given us is CROSSING MINIMISATION, and that is one
named rule rather than a dependency the always-on mirror would carry forever:
a child sits on its parent's own angle and moves only to clear a neighbour.

THE BARYCENTRE SWEEP WAS TRIED AND REMOVED. It ordered each level by the mean
position of a node's parents, which is the Sugiyama framework's answer.
Ordering alone still left a child anywhere along its row. Taking the parent's
angle and pushing only to clear a neighbour does everything the ordering was
for and fixes what it could not.

## Outward means outward

A CHILD WANTS ITS PARENT'S ANGLE. The sweep moves it the minimum that clears
its neighbour, and the block is re-centred on where the items wanted to be.

THE BAND IS A WALL. Nothing may leave it, ever.

IT USED TO LEAK, and the mechanism is worth keeping: the sweep only ever
pushes items APART, never together. A function wants its requirement's angle;
requirements own a whole section and functions own half of it. So a function
under a requirement on the far side of the section started outside the design
slice, and nothing brought it back. It was drawn in the neighbouring section,
belonging visibly to nothing.

THE FIX IS TO CLAMP TWICE. The wants are clamped before the sweep and the
result is clamped after. A card that cannot have its parent's exact angle
gets the nearest angle it is allowed, which is what "outward means outward"
degrades to once a band narrower than its parent's exists at all.

## Every section takes the angle it needs

EQUAL WEDGES ARE THE CIRCLE'S REAL WASTE. One value prop carrying sixty rows
and another carrying thirteen each got a sixth of the turn, so the crowded one
set the radius for everybody while the sparse one drew empty arc.

EACH SECTION'S SHARE IS ITS OWN LOAD over the total. The outer ring is sized
by what the whole circle holds, not by six times its worst wedge. Closing one
gap lets its neighbour round up against it, and the whole drawing collapses
inward.

IT IS COMPUTED, NEVER STORED. The loads come from whatever is in scope at this
layout, so a filter or a selection re-cuts every section.

## The subsegments

A WEDGE RUNS WHOLE WHILE THE SPINE LASTS. At the spine's end it divides into
two, three or four slices, and each goes its own way outward.

THE DIVISION HAPPENS ONCE. A node on the last spine level may point into
several slices — the one place an item belongs to more than one. Past it there
is no cross-coupling: a node in one slice never points at a node in another,
and no edge is drawn between them.

WHY IT EXISTS: design and testing answer the same requirement and answer it
differently. Design goes one way, testing the other, and a reader can tell
which is which by where it sits rather than by reading it.

AN EMPTY SLICE STILL HOLDS ITS ARC. The test levels do not exist yet; the
space is reserved so they land without moving anything.

A SLICE IS HELD, NOT MERELY MARKED. A thin separator was the first attempt and
was worth nothing: at 7% of a wedge nobody could see it, so it signalled
nothing to a reader and reserved nothing for the tests. A reservation that
cannot be seen is not a reservation.

WHAT IT COSTS IS PAID IN RADIUS, not in crowding. A divided ring is sized
against the slice it may use, so it sits further out — and arc is radius times
angle, so the push pays for part of itself.

## The ring gap is the vision's own gap

The distance from the vision to the value props is the drawing's unit of
separation. Every later ring gets at least the same, measured EDGE TO EDGE:
the outermost card of one ring to the innermost card of the next.

IT USED TO BE TWO THIRDS OF THAT. Enough while the rings were sparse. Once the
crowded ones started staggering, their bands ate most of the gap and
consecutive rings read as one smear. Adding the functions made it plain —
requirements and functions ran together with nothing between them.

EDGE TO EDGE IS THE WHOLE POINT. A gap between ring CENTRES says nothing once
a band straddles the ring, which is exactly the case where the drawing gets
tight.

## Staggering must pay for itself

A SPARSE LANE STAYS ON ONE ORBIT. Staggering it would be noise and a thicker
band.

THE TEST IS NOT THE ABSOLUTE RADIUS. That only counts the rings nested inside
and says nothing about this ring's own room. It is whether the BAND the
stagger adds costs less than the ARC it saves, on this ring alone. Nothing is
thresholded; the cheaper answer wins.

THE RADIUS AND THE STAGGER ARE ONE DECISION, taken for the whole ring. Every
section shares a ring, so both numbers must suit the hungriest of them.

IT USED TO PICK THEM APART: each section proposed a pair, and the ring took
the largest radius with whatever stagger came attached. A section needing
three orbits could be handed a bigger radius and one orbit — a third of the
room it asked for — and its cards then spread past their own arc into the next
section.

## The relax pass

THE STAGGER IS ANGLE-BLIND and the cards are axis-aligned, so at some angles
the radial step and the arc offset cancel on one axis. Any pair still
overlapping pushes its outer card further outward along its own angle, so the
parent line keeps its direction, until the axis-aligned clearance holds by
check rather than by formula.

THE BAND IS A HARD CEILING. A card sits on its ring, one step out or one step
in. Never further. The push stops at the band's outer edge and the card stays
where the stagger put it.

IT USED TO BE UNBOUNDED, and that is what the owner saw: the requirements
climbing five steps out of their ring until the ring was no longer a ring and
the drawing read as one smear. The push is a last resort for a clash the arc
could not foresee. Where a whole lane does not fit, the answer is a BIGGER
RADIUS, chosen once, not sixty passes of shoving.

## Cards and labels

EVERY NODE IS A CARD, uniformly sized. A dot with a label beside it is a
pixel-wide click target; the card is the whole thing, and it is the same size
for every node so the rings read as rings. The width fits the longest label
the owner named, and anything longer ellipses.

LABELS NEVER ROTATE. A radial arrangement tempts you to turn the text with the
angle, and then half of it reads upside down. A label keeps its own width, and
that width is what the ring spacing has to clear.

## Arcs and sectors

ONE LABELLED ARC per section, or one per slice of it. This is what a reader
sees when the drawing is too small for cards.

IT IS THE MAP AT ALTITUDE. Zoomed out the cards are specks and the arcs carry
the meaning: this wedge is that value proposition, and past the requirements
it divides into design and tests. Zoomed in the arcs fade and the cards take
over.

THE SECTORS ARE THE CLICKABLE PIE. One per section per ring, so "the ledger's
requirements" is a thing a pointer can hit. The label arcs alone were not
enough — they named the whole section, and a reader who wants one ring of it
had nowhere to aim.

A SECTOR SPANS ITS RING'S BAND, from halfway in to the previous ring to
halfway out to the next, so the sectors tile the circle with no gaps and no
overlaps and every point belongs to exactly one. It runs separator to
separator, taking the section's whole angle rather than the share the cards
are allowed.

## Re-origin

ANY NODE CAN BE MADE THE CENTRE. Its own descendants become the drawing and
everything else falls away.

A LEVEL IS A DISTANCE, NOT A TYPE. From the vision the first ring is the value
props, because that is what the vision's children are. From a use case the
first ring is its requirements. The rings, the wedges, the bands and the
slices all take the level as given, so all of it survives unchanged.

WHAT SURVIVES A RE-ORIGIN IS THE TYPE ORDER. A requirement still sits inside a
function, because that order is what the trace MEANS. What moves is where the
counting starts.
