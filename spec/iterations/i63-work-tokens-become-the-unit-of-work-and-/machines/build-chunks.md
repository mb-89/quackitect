---
steps:
  - id: mark-a-card
    statement: the compiler reads a mark rather than inferring from shape - any line that opens a part, at any level, heading or top-level list item
    depends_on: []
    realization: code
  - id: prove-the-format
    statement: mark the two cards that disagree and check the compiler holds on both - one whose steps are headings, and the retro whose steps are a numbered list
    depends_on:
      - mark-a-card
    realization: code
  - id: the-work-store
    statement: every write to a piece of work in one module - mint on entry, match by identity on re-entry, place, take, settle
    depends_on:
      - mark-a-card
    realization: code
  - id: the-work-offer
    statement: the two hot-path reads - what a hand may take now, and what a position owes per slot
    depends_on:
      - the-work-store
    realization: code
  - id: merge-the-surfaces
    statement: the machine and the work editor render in one webview and keep independent viewports - zooming one leaves the other untouched
    depends_on: []
    realization: code
  - id: the-bucket-editor
    statement: buckets, folding, two panes, the drag onto a state, and the plus that mints from a template
    depends_on:
      - the-work-offer
      - merge-the-surfaces
    realization: code
  - id: mark-the-corpus
    statement: mark the remaining cards, once the format has been proven on the awkward cases
    depends_on:
      - prove-the-format
    realization: document
---

# The build drawing

Seven chunks in two strands, joining at the editor.

## The order is risk first, and the risk is a format nobody has run

MARK A CARD COMES FIRST because everything downstream reads what it produces,
and because it is the one piece a spike proved wrong. Building it first buys the
feedback earliest.

PROVE THE FORMAT IS ITS OWN CHUNK rather than a step inside the first. The
owner's ruling is to check on a few cards before marking all of them, and a
chunk that both builds and proves would let the proof be skipped quietly.

MARKING THE CORPUS IS LAST. 137 cards against an unproven format is 137 guesses,
and a wrong format costs a second pass over the same 137.

## The spine is the second lens

THE STORE, THE OFFER AND THE COMPILER ARE ONE THIN END-TO-END SLICE: a card
becomes work, the work sits somewhere, and a hand is offered it. Every seam
between the three is exercised before any surface exists.

## Two strands, and the later lot leans on one earlier lot

THE ENGINE STRAND runs mark-a-card, the store, the offer. A chain, because each
genuinely needs the one before it.

THE SURFACE STRAND starts at merge-the-surfaces, which depends on nothing in the
engine. It is layout plumbing and can be built while the engine strand runs.

THEY JOIN AT THE BUCKET EDITOR, which is the only chunk with two inbound edges.
It cannot start before the offer publishes a count and the store accepts a move.

## What flows across each edge

- mark-a-card to prove-the-format: the compiler, and the two fixture cards.
- mark-a-card to the-work-store: the set of parts a card declares, which is what
  minting derives from.
- the-work-store to the-work-offer: every piece of work with its place, status,
  difficulty and declared predecessor.
- the-work-offer to the-bucket-editor: the owed count per slot, and what is
  ready.
- merge-the-surfaces to the-bucket-editor: one document holding two viewports,
  which is what makes the drag ordinary.
- prove-the-format to mark-the-corpus: a format nobody has to guess at.

## Two measurements ride the build rather than preceding it

THE WHOLE COST OF A MINT, once minting exists. Its own probe is one hop timed
twice, with minting and without, and it belongs to the-work-store.

THE WRITE HALF OF THAT MINT, since only the derivation was ever timed.
