---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: dsp-radial-layout
type: "[[design-spec]]"
statement: the trace drawn as deterministic geometry — a wedge per value prop, a ring per level, and one named rule where a layout library would have been
realizes:
  - "el-mirror"
files:
  - "deliverable/engine/trace.ts"
  - "deliverable/engine/trace-layout.ts"
---

## A table's header names columns, never nodes

The reference extractor reads the leading cells of every row that starts with a
pipe, and a bound table's header carries the row TYPE in its first cell. A type
name with a dash in it is shaped exactly like an id, so a table over
`test-spec` reported its own header as a reference resolving to nothing.

THE RULE ROW UNDERNEATH IS WHAT TELLS A HEADER FROM A DATA ROW. It is the only
signal a markdown table offers, and it is the same one a reader uses.

WHY IT STOOD SO LONG: the field beside it is bound the same way over `raid`,
which has no dash and passes straight through. The two differ by a hyphen.

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

## One clickable piece of the pie

ONE CLICKABLE PIECE OF THE PIE — a section at one ring, or one slice of
 that (owner ruling 2026-08-07).

 "THE LEDGER'S REQUIREMENTS" IS A PLACE. Naming a section was not enough:
 a reader who wants one ring of one section needs somewhere to aim, and the
 label arc was the only target there was.

## A typed node names its own template

A TYPED NODE NAMES ITS OWN TEMPLATE (owner, 2026-08-05). `type:
 "[[value-prop]]"` points at the item template that says what a value prop
 must carry, so a reader is one hop from the rules and Obsidian draws the
 edge. A bare `value-prop` means exactly the same thing — the link is the
 readable form, never a second syntax to support.

## Mechanical checks the template declares

MECHANICAL CHECKS THE TEMPLATE DECLARES (owner order 2026-08-06): the
 rules ride the template's own frontmatter, generic engine code applies
 them, and they fire for EVERY hand — the agent's submit and a person's
 panel edit run the same conformance.

## The upward edge has one slot and several names

THE UPWARD EDGE HAS ONE SLOT AND SEVERAL NAMES (owner ruling
2026-08-07, machines/trace-schema.md): refines, satisfies,
implements, verifies — the relation differs, so the word does.

The MODEL keeps one slot on purpose. Everything downstream — the
wedge walk, the coverage checks, the drawing — asks the same
question of every node: what does this serve? Splitting the slot
would fork that question per type for no gain.

EVERY SCHEMA KEY FOLDS, or its whole level goes invisible: the
elements, the interfaces and the test-specs each shipped with their
key missing here, and none of them drew until somebody looked.

## Every wedge a node belongs to

EVERY wedge a node belongs to. A node whose ancestry reaches two value
 props is DRAWN IN BOTH (owner, 2026-08-06) — one node in the data, two
 places in the picture.

 The alternative was one placement plus an edge crossing the whole circle to
 reach its other parent, and those lines are what made the drawing
 unreadable. Sharing WITHIN one prop is fine and stays: those lines are
 short and local.

## The center-distance floor

THE CENTER-DISTANCE FLOOR (owner, 2026-08-06): no two node centers sit
 closer than two thirds of the inner ring — a fixed value, and radii GROW
 where it would be undercut. It also subsumes the card-overlap rule: at
 this distance a 260×60 card clears its neighbour at every angle.

## The band straddles its ring

THE BAND STRADDLES ITS RING (owner sketch, 2026-08-06): one card pushed
 OUT and one pulled IN, rather than every sub-orbit growing outward. The
 ring keeps its own radius as the band's middle, so the band costs half as
 much clearance on each side and the next ring starts nearer.

## One written reference

ONE WRITTEN REFERENCE, REDUCED TO THE ID IT MEANS.

 THE MACHINE IS GENEROUS HERE ON PURPOSE (owner, 2026-08-06). A person
 writing a reference has a file in front of them, and there are four honest
 ways to name it. Refusing three of them teaches nothing — it just makes the
 form feel broken.

 All of these mean the same node:

 - `nbr-obsidian` — the bare id
 - `[[nbr-obsidian]]` — a wiki link, which is what Obsidian pastes
 - `spec/trace/neighbour/nbr-obsidian.md` — the path from the root
 - `spec\trace\neighbour\nbr-obsidian.md` — the same, Windows-shaped
 - `nbr-obsidian.md` — just the file name

 A path reduces to its LAST SEGMENT with `.md` dropped, because the file
 name IS the id everywhere in the trace. So a unique file name resolves
 whether or not the folders above it were typed correctly.

 What stays strict is the ID ITSELF. It must look like an id, and it must
 resolve to a standing node — those checks are the point of a reference.

## A list line is dash-led or numbered

A LIST LINE IS DASH-LED OR NUMBERED (2026-08-09). The rank-cut template
numbers its rows, because the numbers ARE the order, and reading only
dash-led lines found nothing in one — so cut-criteria refused as empty
while its own line check passed. Fifth time that pair has disagreed.

## The references a table row carries

THE REFERENCES A TABLE ROW CARRIES — the compare-card's answer shape.

 A card records one answered pair per row: the two items and the verdict.
 refsIn above reads a LIST, one dash-led id per line, so it found nothing in
 a row and the field refused as empty while its own line check passed. No
 content could satisfy both, which is a field nobody can ever fill.

 Only the first two cells are items. The third is the verdict, and a
 verdict is not an artifact.

 HOW MANY CELLS ARE ITEMS DEPENDS ON THE ROW (2026-08-09). A card answers
 with two items and a verdict. A dsm answers with ONE element and the value
 written onto it, so reading two cells there offered the cluster name as an
 artifact and the type check refused it. The caller knows which shape it
 has; it says so.

## Ring k must hold the worst wedges count at

Ring k must hold the WORST wedge's count at that level, because the radius
 is GLOBAL and a ring is one circle for everybody.

 EACH RING CARRIES ITS OWN LOAD (owner, 2026-08-06). The shared gap made
 the crowded outer ring blow every inner ring up with it, and the drawing
 wasted its middle. Now a ring grows only as far as ITS worst wedge needs
 at full stagger, and the floor chain keeps it clear of the previous
 ring's outermost sub-orbit. Inner rings collapse; the spacing does not.

## The ring answers to its hungriest section and n

The ring answers to its HUNGRIEST section, and n items need n-1 gaps.

THE ARC IS THE ONE THIS LEVEL MAY ACTUALLY USE (owner ruling
2026-08-07). Below the split that is half a section, so the ring has to
grow to hold the same rows in half the angle. Sizing against the whole
section instead left the cards overlapping, and the pass that prises
them apart smeared the requirements over five layers.

## The text must fit the arc it rides

THE TEXT MUST FIT THE ARC IT RIDES (owner ruling 2026-08-07). A textPath
 draws only what fits and silently drops the rest, which is how "vendoring"
 arrived on screen as "ndorin".

 So the size comes DOWN until the whole word fits. A glyph is about 0.58 of
 its font size wide in this face, which is close enough — the answer only
 has to be small enough, not exact.
