---
minted_in: i1
id: dsp-form-editors
type: "[[design-spec]]"
statement: one client editor per evidence template, carried by a registry that assembles render, collect and behaviour blocks
realizes:
  - "el-mirror"
files:
  - "project/deliverable/engine/editors/index.ts"
  - "project/deliverable/engine/editors/kinds.ts"
  - "project/deliverable/engine/editors/checklist.ts"
  - "project/deliverable/engine/editors/choice-rationale.ts"
  - "project/deliverable/engine/editors/compare-card.ts"
  - "project/deliverable/engine/editors/decision-matrix.ts"
  - "project/deliverable/engine/editors/dsm.ts"
  - "project/deliverable/engine/editors/element-matrix.ts"
  - "project/deliverable/engine/editors/exposure-pick.ts"
  - "project/deliverable/engine/editors/findings.ts"
  - "project/deliverable/engine/editors/list.ts"
  - "project/deliverable/engine/editors/morph-box.ts"
  - "project/deliverable/engine/editors/node-table.ts"
  - "project/deliverable/engine/editors/pareto-plot.ts"
  - "project/deliverable/engine/editors/per-item.ts"
  - "project/deliverable/engine/editors/rank-cut.ts"
  - "project/deliverable/engine/editors/scenario-deck.ts"
  - "project/deliverable/engine/editors/sensitivity.ts"
  - "project/deliverable/engine/editors/table.ts"
---

## Responsibility

Each evidence template names its editor; the registry assembles every
editor's render, collect and behaviour source into the one client
script. Adding an editor is adding a file. An editor whose guard does
not match falls through to the plain text box, honestly.

## How many there are

HOW MANY THERE ARE, AND HOW MANY ARE DONE (owner ruling 2026-08-08).

It used to read answered out of answered-plus-ESTIMATE, and the estimate
could rise without bound — ninety criteria once showed about five
thousand, more than the entire cross product. A denominator that grows
while you work reads as the sort having failed.

Both numbers here are settled facts. An ordering walk counts the items
placed; an equivalence walk counts the pairs answered.

## The element matrix

THE ELEMENT MATRIX, DRAWN — the numbered-cell sketch made live (owner
design 2026-08-10). Source elements down, destination elements across.
A cell shows what stands: the owed crossings and the interfaces naming
them. An owed cell with no interface carries a NAME button; the click
mints the interface skeleton server-side with the crossing flows already
in `carries`, and the redraw shows the link where the button was.

EVERYTHING DRAWN IS COMPUTED — allocation off the elements' implements,
crossings off the functions' flows, the declared side off the interface
nodes. This editor stores nothing; the section is for the argued spread.

NO BACKTICK IN ANY BODY. Each is one template literal.

## The exposure chart

THE EXPOSURE CHART — damage against likelihood, every standing register
entry a dot (owner design 2026-08-10). Dots are coloured by KIND from the
palette's register section, with the legend beneath; a picked entry — one
standing in the list below — wears a red ring. Hover names the entry; a
click opens it in the editor. The pick list decides; the chart informs.

The rows reuse the list editor's classes on purpose: .sfli rows are
collected by the list's own collect branch, so this editor stores nothing
of its own.

## The editor registry

THE EDITOR REGISTRY. One file per editor, assembled into the client script
here, so adding one is adding a file rather than finding a wiring.

WHAT THIS REPLACED. Every editor lived inside render.ts's client-script
template literal, and its SERIALISER lived in sfCollect four hundred lines
away. Adding an editor meant finding a wiring that nothing pointed at — and
`table` was simply never added, so the checker judged the field and the
mirror abandoned it to a textarea (owner ruling 2026-08-08).

THE ORDER IS THE DISPATCH ORDER. An editor whose render source returns only
inside a guard falls through to the next branch, and finally to the plain
textarea at the end of sfEditor. per-item relies on that.

## One file per editor

ONE FILE PER EDITOR (owner ruling 2026-08-08).

WHAT WAS WRONG. Every field editor lived inside render.ts's client-script
template literal, and its SERIALISER lived in sfCollect four hundred lines
away. So adding an editor meant finding a wiring that nothing pointed at,
and the `table` editor was simply never written — the checker judged the
field and the mirror abandoned it to a textarea.

THE SHAPE. An editor is two pieces of client source that belong together:

  - `render` runs inside sfEditor. In scope: fl (the field's line), tm (the
    template's mechanics), args (the field's arguments), paths, hint,
    facts, name, ph. It returns HTML.
  - `collect` runs inside sfCollect. In scope: fields (the object being
    built), push (append a markdown line to a field). It reads the DOM.

Both are SOURCE STRINGS, because the client script is assembled rather than
bundled. Write them as template literals and copy the escaping verbatim: a
`\\n` here becomes `\n` in the emitted script, which is what the client
needs. Interpolation does not re-process escapes, so a verbatim move is
safe.

NOTHING HERE IS PER FIELD. The editor is the TEMPLATE's shape; the columns,
options and items are the FIELD's arguments. An editor that reads a field's
name and behaves differently has stopped being a template.

## The morphological box

THE MORPHOLOGICAL BOX. Rows are function clusters, cells are the options
serving them, and a curve across the box is one candidate architecture.

THE GRID IS DERIVED AND UNEDITABLE HERE. It comes from the option nodes the
seven finders minted, so there is nothing to type into a cell — an option is
changed in its own note. What a person DOES here is draw lines.

THE LINES JOIN DOTS, NOT CELLS (owner design 2026-08-08, and it replaced a
first cut that ran the curve through cell centres). One cell can belong to
several candidates, so a cell cannot carry a colour. Instead every cell holds
a fixed row of dot SLOTS — one per candidate — and a candidate's dot always
sits in its own slot, wherever it goes. The curve joins those dots.

Two things fall out of that, and both are the reason for it:
  - A cell on four lines shows four dots, side by side, in a stable order.
  - A line keeps a consistent offset down the chart, so two lines through
    the same cells stay readable instead of overlapping exactly.
The slots WRAP inside the cell, so a chart with two dozen candidates gets a
second and third row of dots rather than a cell that grows sideways.

HOW A LINE IS DRAWN. Hold shift and click cells; each click adds a waypoint,
and clicking a second cell in a row you already visited MOVES the waypoint.
Release shift to keep it. Escape abandons it. A drawn dot can also be
DRAGGED to another cell in its own row.

A LINE IS A CANDIDATE ONLY WHEN IT IS COMPLETE — one option per cluster
(owner ruling). An unfinished line is kept and drawn dashed rather than
thrown away, because a person mid-thought is the normal case, and the state's
own check names it at submit.

COLOUR IS A FUNCTION OF POSITION, never stored. See sfmbPen below.

NO BACKTICK MAY APPEAR IN ANY BODY BELOW, not even inside a comment. Each
body is one template literal and a backtick ENDS it — everything after would
become real TypeScript. It has happened twice.

## Every column wraps

EVERY COLUMN WRAPS, AND THE ROW HEADER WRAPS TOO (owner, 2026-08-09).
The header carried white-space:nowrap, so a cluster name held the whole
chart open and pushed the cells off the side. A chart nobody can see
across is a chart nobody draws on.

## A min-width is what makes it wrap

A MIN-WIDTH IS WHAT MAKES IT WRAP (owner, 2026-08-09). Wrapping alone
let the table squeeze the header to one character per line, because
overflow-wrap:anywhere permits a break between any two letters. The
floor gives the column a width to wrap INSIDE.

## The slots are filled by the client

THE SLOTS ARE FILLED BY THE CLIENT, never here. The count follows the
number of lines, which changes as a person draws, so rendering them
server-side would put two sources in charge of one thing.
EVERY CELL IS AN OPTION, SO EVERY CELL LINKS TO ITS NOTE (owner,
2026-08-09). It opens in the EDITOR rather than the details pane,
because the pane is already holding the matrix you are reading.

## A constrained column offers its source

A CONSTRAINED COLUMN OFFERS ITS SOURCE, and HOW it offers it is the
field's own declaration (owner ruling 2026-08-08).

CLOSED IS THE DEFAULT, because a known set means the cell holds a member
of it. pick_free names the exceptions, and the comparison cards are why
the exception exists: their cells hold an id PLUS something else — an
operator, or the reason two rows measure one thing — and a closed
chooser would forbid both.

NO BACKTICK MAY APPEAR BELOW, not even inside a comment. This whole body
is one template literal, and a backtick ENDS it — everything after would
become real TypeScript. It happened here on 2026-08-08.

## A dropdown wears the theme

A DROPDOWN WEARS THE THEME, INCLUDING ITS LIST (owner, 2026-08-09). A
transparent select looks right closed and opens an OS-default list:
white on a dark panel, which is the one thing ux.md forbids.

THE OPTIONS ARE PAINTED BY THE STYLESHEET, not here. Forty inline
styles would say the same thing forty times, and the markup is what
the script tests read.

## One page at a time

ONE PAGE AT A TIME, with previous and next (owner ruling 2026-08-08).

WHAT THIS REPLACED. Stacked details groups, ten rows each, every group
on the page at once. That is the whole list with folds in it, not
pagination, and over ninety criteria it was unreadable. The owner named
the shape they meant: click left and right through pages, and choose how
big a page is.

EVERY ROW STAYS IN THE DOM, on the page or not, so whatever collects
them on save is untouched. A pager that removed rows would silently drop
the answers on every page but the one showing.

## Readable at any axis count

READABLE AT ANY AXIS COUNT (owner report 2026-08-09: thirty-five axes
squeezed into a fixed card were unreadable, and nothing could grow it).
The svg fills the box's HEIGHT and keeps its shape, so the native
resize handle grows the whole drawing; what overflows the card scrolls
sideways instead of being squeezed into it.

## Nothing is collected

NOTHING IS COLLECTED, AND THAT IS THE POINT (owner ruling 2026-08-08:
"if it's derived, then it doesn't need to be in the notes").

The first cut wrote the front into the field so the gate could read it
without recomputing. That is exactly the second copy this design exists to
avoid — argued against one hour earlier, in this same file's own header,
and then built anyway. A stored front drifts from the scores the moment a
single number changes, and nothing would report the disagreement.

The gate recomputes. It costs a pass over a table of at most a few dozen
rows, and it cannot be wrong.

## The ranked list with a cutoff

THE RANKED LIST WITH A CUTOFF. One row is the last that still counts;
anything can be struck with a reason; anything can be moved, and a move owes
a rationale.

IT REPLACED FOUR COLUMNS (owner ruling 2026-08-08). cut-criteria asked
cut_proposed, cut_verdict, cut_reason and criterion_band of every row — over
ninety rows that is the same question asked ninety times, and the answers
were free to disagree with each other.

THE ORDER IS COMPUTED, NOT STORED (owner ruling 2026-08-09). It arrives in
args.items already sorted worst-breakage first, and that sort is the answer
rather than a starting point.

A STORED POSITION USED TO WIN, AND THAT WAS THE DEFECT. Once a numbered list
was saved, its numbers beat the computed order forever, so a corrected sort
could never reach the page. Measured in iteration one: a corrosive row sat
first of seventy-two, above every fatal one, because an earlier pass had
written it there.

THREE MARKS, AND THEY MEAN DIFFERENT THINGS:

  - THE CUTOFF. Exactly one row carries it: the last row that is still a
    criterion. Everything below is out, by position alone, and needs no
    reason of its own — the reason is the cutoff.
  - A CUT. One row struck on its own merits, with a reason. It STAYS on
    display, struck through, because an option that vanishes gets
    re-proposed by somebody who never knew it was considered.
  - A MOVE. Up or down, one place at a time. A moved row is marked and owes
    a rationale, because moving a row past another jumps an ordering that
    was made blind, and that is the one edit that can be aimed at a
    favourite.

NO BACKTICK IN EITHER BODY, not even in a comment. Each is one template
literal and a backtick ends it.

## What it looked like at the last save

WHAT IT LOOKED LIKE AT THE LAST SAVE, carried on the table so revert has
somewhere to go back to (owner report 2026-08-08: a move could not be
undone). It is the SAVED state, not the previous DOM — revert means back
to the last save, not back one step.

## The scenario deck

THE SCENARIO DECK — ATAM's walk dealt one card at a time (owner ruling
2026-08-10). A card shows the SCENARIO (the quality requirement and its
six-part section), the PATH (the elements and interfaces that carry it) and
the VERDICT: three parts separated by OR, each with its explainer FIRST.
A verdict posts at once; at-risk and unaddressed mint their register entry
before the page redraws. The fitness flag is not a verdict — it lands on
the requirement node as fitness_candidate: true.

The structure numbers render beneath the deck, INFORMATION ONLY — nothing
about them is typed (owner ruling 2026-08-10).

The panels and styles ride in from card-parts.ts — one copy, shared with
the compare card and the flip deck. No backtick in any body.

## The flip deck

THE FLIP DECK — one card per fragile cell, ruled one at a time (owner
ruling 2026-08-10: the same binary-card shape as the compare card, three
panels instead of two). A card shows the CELL (the requirement), the
WINNER and the RIVAL; the one verdict is "rival wins — credible", and
"next" moves on without ruling. Ruling posts at once — no save step —
and the engine mints the RAID tripwire before the page redraws.

ONLY A REACHABLE FLIP IS DEALT: a rival needing more than three swings is
named on one line and not asked about. Nothing is silently dropped.

The panels and styles ride in from card-parts.ts — one copy, shared with
the compare card. No backtick in any body.

## The typed table

THE TYPED TABLE. Columns, their help and their pick sources are the FIELD's
arguments; the grid, the row buttons and the storage format are the
template's mechanics.

IT DID NOT EXIST UNTIL 2026-08-08. stateform.ts had a `table` branch that
counts cells against the declared columns and refuses prose, and the
renderer had none — so the field fell through to the generic textarea and a
person typed markdown by hand.

IT REUSES THE SURFACE RATHER THAN REBUILDING IT (ux.md, and the owner's
correction the same day). The first build invented its own borders, three
type sizes and a dead minus button with no plus. Now:

  - the table wears `sfnodetable`, the class the node table already uses,
    so it inherits the host theme instead of naming colours;
  - each row wears `sfrow` and carries sfRowBtns(), so + and − are the SAME
    controls with the SAME handlers as a list.

A PICKED COLUMN IS A CHOOSER, NOT A HINT (owner ruling 2026-08-08: "this
should just show me all the clusters, and I can only choose clusters"). A
column with a pick source draws a select. `pick_free` names the exceptions,
where the offer is help and typing past it is legal.

AN EMPTY OFFER SAYS SO. `$clusters` before partition-functions has run
resolves to nothing, and a chooser with nothing in it looks exactly like a
text box — which is how these columns got reported as free text after they
were already wired up. The select names what it is waiting for.

ONE THING HERE HAS NO PRECEDENT, and the claim is made out loud: the
per-column help line under each heading. No other editor carries guidance
per column, and a header of single words leaves the filler guessing.

## The grid read view

THE GRID READ VIEW (owner, 2026-08-09: "the rows are the candidates,
the columns are the axes, the points in the cells"). A pairwise table
— two closed-pick key columns and a value — cannot be READ as a flat
list: comparing two rows means finding them thirty-five lines apart.
So it also renders as a MATRIX: first key down, second across, the
value in the cell, the remaining columns behind a cell click. The
stored shape does not change, and the flat rows stay the editor,
folded underneath.
