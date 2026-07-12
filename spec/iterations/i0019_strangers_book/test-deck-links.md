---
id: test-deck-links
type: test
statement: Opening a deck reflects its stable anchor in the URL; loading with that fragment opens the deck; the anchor derives from the manifest and survives a re-render; the deck section carries a machine-legible slideshow marking with a name and boundary; no deck appears in the table of contents.
class: executed
verify: selftest:deck-links
killer: false
---
## Rationale (not load-bearing)
The deep-link primitive: reflection, jump-on-load, and anchor stability - the three ways a
shared link can break.
