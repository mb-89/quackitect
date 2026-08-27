---
form: merge-the-surfaces
by: agent
signed_off: 2026-08-26T15:49:49.617Z
authors: agent
files:
---

# Evidence form / merge-the-surfaces

## current_situation

The work store and the work offer existed and nothing showed their answers to a person.

The design says the machine and the work editor must render in one webview, because no drop crosses two of them, and that they must still behave as two.

### The merge turned out to be mostly already true

THE PANEL IS ONE SERVED DOCUMENT with a card grid. Each card is declared in `deliverable/views/cards.md` and fills its own body. The machine is already a card there, beside the log, the details pane and the database.

SO "ONE WEBVIEW" NEEDED A CARD, NOT A REBUILD. The two surfaces share a document the moment both are cards, which is what makes a drag between them ordinary.

### And the viewport was already separate

THE MACHINE'S ZOOM MOVES ITS OWN SVG VIEWBOX, saved per machine. It has never been a transform on a shared ancestor, which is the lazy version the design forbids.

THAT WAS CHECKED RATHER THAN ASSUMED. A case reads the client source and refuses a zoom applied to the body or to the card grid.

### What was genuinely missing

A card, a widget to fill it, and a way for the page to know which record is open. All three are built here.

## built

A CARD, A WIDGET, AND THE TWO WIRES THAT REACH IT.

### The card

`deliverable/views/cards.md` declares `work`, showing the `work` widget. It sits LAST, so no existing card renumbered.

That file travels with the product rather than the engine, which is why adding a card needed no engine change to the card list itself.

### The widget

`deliverable/engine/work-card.ts`. It renders one block per position, and two columns inside each: what must be taken in, and what must be produced.

Every row is `draggable` and carries its own id, its place and its slot, which is what the drag will read.

A row says which hand is on it, and says nothing at all when none is.

AN UNSIZED ITEM IS MARKED rather than drawn as ordinary. No hand can be offered it, so the card says so.

### The counts are consumed, never derived here

The card asks the offer and draws the figure. An absent count draws a dash carrying its reason as a title, never a zero.

THAT IS A CASE, not a claim. One test breaks an item's frontmatter deliberately and asserts the dash, the reason, and that the unreadable piece is reported rather than skipped.

### Two wires

`Session.boundRecordHome()` — the open record's own folder, which is where its work lives while it is open. The walk always knew this; nothing had asked it.

A `work` branch on the widget route, so the card's expand button has somewhere to land. A button pointing at a route nobody serves opens a blank page, and that reads as the card being broken.

### The surface guard refused the first attempt, and it was right

`SE-C-146` refused `work-card.ts` because the panel did not yet reach it. The rule is that only a module the surface reaches may emit widget markup.

THE ORDER HAD TO INVERT. The wiring went into `render.ts` first, and then the file was allowed to exist. That is the guard doing exactly what it is for: a new emitter nothing reaches is a second surface, and there is no way to write one by accident.

### What the test file proves

`deliverable/tests/surfaces-merged.test.ts`, 11 cases.

TWO CLAIMS THAT PULL AGAINST EACH OTHER. They must share one document, because no drop crosses two webviews. They must not share a viewport, because to the person they are two editors.

- Both are cards in the one page, read off the real declaration.
- The work card took the last number, so nothing renumbered.
- The zoom moves the machine's own SVG viewBox. A case reads the client source and refuses a zoom applied to the body or to the card grid, which is the lazy version the design forbids by name.
- The work card scrolls in its own body and carries no transform.
- With no record open it says so rather than drawing an empty list, because an empty list looks exactly like a finished one.

## follow_up

The bucket editor is next, and it is the join: both strands meet there.

### What the bucket editor inherits

A CARD THAT ALREADY RENDERS ROWS, each `draggable` and carrying its own id, place and slot. The drag needs a listener pair rather than a new surface.

THE COUNTS ARE ALREADY CONSUMED, not derived. The card draws the figure the offer produces, and an absent one draws a dash with its reason rather than a zero.

### What is still genuinely new, and the design says so

Four things, and none of them exists yet.

- Grouping rows into buckets, and folding a bucket by its header.
- Dragging a row from the work card onto a state.
- Revealing a destination that is holding nothing while a row is in the air.
- A plus that mints a piece of work from a template.

### One thing the layout note in the design got right

THE LAYOUT MOVES, and it moved the cheapest way available. The work card took the LAST number, so no existing card renumbered. The numbers are muscle memory and a shift under the reader's hand is the failure that would have caused.

### One red still stands at HEAD

The read-once guard, measured and recorded, waiting for `fix-findings`.

## anything_else

THREE THINGS THE BUILD FOUND THAT WERE NOT IN THE PLAN.

### The widget vocabulary is one table and it paid for itself

`deliverable/engine/widget-kinds.ts` holds every widget name once. Adding the word `work` to it gave three things at once: the route gate admits `/widget/work`, the type narrowing accepts the branch, and the tool description that lists the widgets to an agent picked it up.

THE FILE'S OWN COMMENT SAYS WHY IT EXISTS. The vocabulary was written out eleven times and carried four different answers, and two of those were live.

### A palette variable that does not exist is a silent no-colour

The first stylesheet used `--se-bad`. There is no such variable. It would have rendered with no colour at all and looked like a styling choice.

THE PALETTE WAS READ RATHER THAN GUESSED AT. Its red is `--se-fail`, and its own comment reserves green, red and yellow so no other role can wear a verdict colour.

TWO MARKS BOTH WANT ATTENTION and they are separated BY SHAPE. The unreadable line takes a left border; an unsized item takes italics and the muted colour. Two yellows would have asked the reader to compare hues from memory.

### A deletion the owner ruled on is refused by the evidence

The register entry about a prototype arriving after the winner was ruled a note rather than a register item. Removing it was owed.

IT IS NOT REMOVED, and the reason is mechanical. Two SIGNED evidence forms cite it by id: the architecture gate and the prototype spawn. Deleting it would leave two standing claims pointing at nothing.

SO IT STAYS FOR THE RETRO, which is where the owner also said the register gets read. The check cost one search and saved two signed claims.
