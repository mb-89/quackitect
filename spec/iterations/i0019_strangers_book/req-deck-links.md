---
id: req-deck-links
type: requirement
statement: When a reader opens a slideshow, the book shall reflect it in the URL. When a URL carries a deck anchor, the book shall open at that deck. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a reader opens a slideshow in the book, the book shall reflect the deck in the URL fragment, so the address bar is always a shareable link to what is on screen.
2. When the book loads with a URL fragment naming a deck, the book shall open at that deck directly.
3. The book shall give every deck a stable, human-readable anchor id derived from its manifest, so links survive re-renders.

## Rationale (not load-bearing)
The primitive under the discoverability triangle. Mirrors the stable figure-element ids
(go-fig-elem-ids) - decks get the same citizenship figures already have.
