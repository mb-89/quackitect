---
id: req-ifu-split-slide
type: requirement
depends_on: []
statement: The book shall render each IFU slide as a left text half and a right visual half, the visual an embedded book rendering where one fits.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Design decision (owner, 2026-07-17)

- Every slide has a left half and a right half.
- The left half is text. The right half is a picture, a diagram, or a rendering.
- The right half may embed a rendering straight from the book, since the book is HTML.
- An embedded rendering stays interactive: the reader can zoom it and click into it. Example: a slide about the timeline renders the real timeline on the right.
- The style follows the Perun YouTube channel's clean, structured, analytical slides, in our own palette.
- Fireship's punchy split slides are a secondary reference, but not its black and orange.
- The deck markdown already splits a slide into columns with a `|||` marker and embeds a figure with a `fig:` line. This requirement extends that toward a live, interactive right half.
- M5 spike finding: the drill target resolves by element id while deck copies slide-prefix ids, so drilling in a copy toggles the original figure. The build resolves drill targets WITHIN the host figure.

## Rationale (not load-bearing)
This is the assertion-evidence slide pattern: one claim in text, supported by visual evidence, never a bullet list. Sources in the M2 evidence doc.
